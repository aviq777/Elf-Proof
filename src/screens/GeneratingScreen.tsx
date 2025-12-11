import React, { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  FadeIn,
} from "react-native-reanimated";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import { RootStackParamList } from "../navigation/RootNavigator";
import { useElfStore } from "../state/elfStore";
import { generateElfCompositePrompt, generateElfVideoPrompt } from "../utils/elfPrompts";
import { ElfSighting } from "../types/elf";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, "Generating">;

export default function GeneratingScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { sceneUri, mode, sceneDescription } = route.params;

  const addSighting = useElfStore((s) => s.addSighting);
  const generationState = useElfStore((s) => s.generationState);
  const setGenerationState = useElfStore((s) => s.setGenerationState);
  const resetGenerationState = useElfStore((s) => s.resetGenerationState);

  const [error, setError] = useState<string | null>(null);
  const hasStartedRef = useRef(false);

  // Animation values
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const elfBounce = useSharedValue(0);

  useEffect(() => {
    // Rotation animation
    rotation.value = withRepeat(
      withTiming(360, { duration: 3000, easing: Easing.linear }),
      -1,
      false
    );

    // Scale pulse animation
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Elf bounce animation
    elfBounce.value = withRepeat(
      withSequence(
        withTiming(-10, { duration: 500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 500, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const rotateStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const elfBounceStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: elfBounce.value }],
  }));

  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    if (mode === "video") {
      generateVideo();
    } else {
      generateImage();
    }
  }, []);

  const generateImage = async () => {
    try {
      setGenerationState({
        isGenerating: true,
        stage: "analyzing",
        progress: 10,
        message: "Analyzing your scene...",
      });

      // Read the scene image as base64
      const imageBase64 = await FileSystem.readAsStringAsync(sceneUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      setGenerationState({
        stage: "compositing",
        progress: 30,
        message: "Finding the perfect spot for the elf...",
      });

      // Use Gemini to analyze and composite the elf
      const prompt = generateElfCompositePrompt(
        sceneDescription || "a room in a house"
      );

      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-image-preview:generateContent",
        {
          method: "POST",
          headers: {
            "x-goog-api-key": process.env.EXPO_PUBLIC_VIBECODE_GOOGLE_API_KEY!,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: prompt },
                  {
                    inlineData: {
                      mimeType: "image/jpeg",
                      data: imageBase64,
                    },
                  },
                ],
              },
            ],
            generationConfig: {
              responseModalities: ["Image"],
              imageConfig: { aspectRatio: "16:9" },
            },
          }),
        }
      );

      setGenerationState({
        stage: "rendering",
        progress: 60,
        message: "The elf is sneaking into position...",
      });

      if (!response.ok) {
        throw new Error("Failed to generate composite image");
      }

      const data = await response.json();
      const imagePart = data.candidates?.[0]?.content?.parts?.find(
        (p: { inlineData?: { data: string } }) => p.inlineData
      );

      if (!imagePart) {
        throw new Error("No image generated");
      }

      setGenerationState({
        stage: "finalizing",
        progress: 90,
        message: "Saving the evidence...",
      });

      // Save the composite image
      const compositeUri =
        FileSystem.documentDirectory + `elf_sighting_${Date.now()}.png`;
      await FileSystem.writeAsStringAsync(compositeUri, imagePart.inlineData.data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Create the sighting
      const newSighting: ElfSighting = {
        id: `sighting_${Date.now()}`,
        type: "image",
        sceneImageUri: sceneUri,
        compositeImageUri: compositeUri,
        timestamp: Date.now(),
        location: sceneDescription,
        isFavorite: false,
      };

      addSighting(newSighting);

      setGenerationState({
        stage: "complete",
        progress: 100,
        message: "Elf sighting captured!",
        isGenerating: false,
      });

      // Navigate to view the sighting
      setTimeout(() => {
        resetGenerationState();
        navigation.reset({
          index: 1,
          routes: [
            { name: "MainTabs" },
            { name: "ViewSighting", params: { sightingId: newSighting.id } },
          ],
        });
      }, 1500);
    } catch (err) {
      console.error("Generation error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong");
      setGenerationState({
        stage: "error",
        isGenerating: false,
        message: "Failed to generate sighting",
      });
    }
  };

  const generateVideo = async () => {
    try {
      setGenerationState({
        isGenerating: true,
        stage: "analyzing",
        progress: 5,
        message: "Preparing your scene for video...",
      });

      // Resize the image to match Sora's required dimensions (1280x720)
      const manipResult = await ImageManipulator.manipulateAsync(
        sceneUri,
        [{ resize: { width: 1280, height: 720 } }],
        { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
      );

      setGenerationState({
        stage: "rendering",
        progress: 15,
        message: "Sending to video generator...",
      });

      // Create video generation request with Sora
      const videoPrompt = generateElfVideoPrompt(
        sceneDescription || "a cozy room at night"
      );

      const form = new FormData();
      form.append("model", "sora-2-pro");
      form.append("prompt", videoPrompt);
      form.append("size", "1280x720");
      form.append("seconds", "8");

      // Include the resized reference image
      form.append("input_reference", {
        uri: manipResult.uri,
        type: "image/jpeg",
        name: "scene.jpg",
      } as unknown as Blob);

      const createRes = await fetch("https://api.openai.com/v1/videos", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY}`,
        },
        body: form,
      });

      if (!createRes.ok) {
        const errorText = await createRes.text();
        console.error("Sora create error:", errorText);
        throw new Error("Failed to start video generation");
      }

      let job = await createRes.json();

      setGenerationState({
        stage: "rendering",
        progress: 25,
        message: "Elf is rehearsing their moves...",
      });

      // Poll for completion
      let pollCount = 0;
      const maxPolls = 180; // 6 minutes max

      while (job.status === "queued" || job.status === "in_progress") {
        await new Promise((r) => setTimeout(r, 2000));
        pollCount++;

        if (pollCount > maxPolls) {
          throw new Error("Video generation timed out");
        }

        // Update progress message
        const progress = Math.min(25 + (pollCount / maxPolls) * 60, 85);
        const messages = [
          "Elf is rehearsing their moves...",
          "The elf is sneaking around...",
          "Capturing the magic...",
          "Almost caught the elf...",
          "Recording elf mischief...",
        ];
        const messageIndex = Math.floor(pollCount / 15) % messages.length;

        setGenerationState({
          progress,
          message: messages[messageIndex],
        });

        const statusRes = await fetch(
          `https://api.openai.com/v1/videos/${job.id}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY}`,
            },
          }
        );

        if (!statusRes.ok) {
          throw new Error("Failed to check video status");
        }

        job = await statusRes.json();
      }

      if (job.status !== "completed") {
        throw new Error("Video generation failed");
      }

      setGenerationState({
        stage: "finalizing",
        progress: 90,
        message: "Downloading the footage...",
      });

      // Download the video
      const contentRes = await fetch(
        `https://api.openai.com/v1/videos/${job.id}/content`,
        {
          headers: {
            Authorization: `Bearer ${process.env.EXPO_PUBLIC_VIBECODE_OPENAI_API_KEY}`,
          },
        }
      );

      if (!contentRes.ok) {
        throw new Error("Failed to download video");
      }

      const blob = await contentRes.blob();

      const toBase64 = (blob: Blob): Promise<string> =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () =>
            resolve(String(reader.result).split(",")[1]);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });

      const base64Video = await toBase64(blob);
      const videoUri =
        FileSystem.documentDirectory + `elf_video_${Date.now()}.mp4`;
      await FileSystem.writeAsStringAsync(videoUri, base64Video, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Create the sighting
      const newSighting: ElfSighting = {
        id: `sighting_${Date.now()}`,
        type: "video",
        sceneImageUri: sceneUri,
        videoUri: videoUri,
        timestamp: Date.now(),
        location: sceneDescription,
        isFavorite: false,
      };

      addSighting(newSighting);

      setGenerationState({
        stage: "complete",
        progress: 100,
        message: "Video sighting captured!",
        isGenerating: false,
      });

      // Navigate to view the sighting
      setTimeout(() => {
        resetGenerationState();
        navigation.reset({
          index: 1,
          routes: [
            { name: "MainTabs" },
            { name: "ViewSighting", params: { sightingId: newSighting.id } },
          ],
        });
      }, 1500);
    } catch (err) {
      console.error("Video generation error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong");
      setGenerationState({
        stage: "error",
        isGenerating: false,
        message: "Failed to generate video",
      });
    }
  };

  const handleCancel = () => {
    resetGenerationState();
    navigation.goBack();
  };

  const handleRetry = () => {
    setError(null);
    hasStartedRef.current = false;
    if (mode === "video") {
      generateVideo();
    } else {
      generateImage();
    }
  };

  return (
    <View className="flex-1 bg-[#0a0f1a]">
      <View
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3">
          <View className="w-10" />
          <Text className="text-white text-lg font-semibold">
            {mode === "video" ? "Creating Video" : "Creating Sighting"}
          </Text>
          {!error && generationState.stage !== "complete" && (
            <Pressable
              onPress={handleCancel}
              className="w-10 h-10 items-center justify-center"
            >
              <Ionicons name="close" size={24} color="#9ca3af" />
            </Pressable>
          )}
          {(error || generationState.stage === "complete") && <View className="w-10" />}
        </View>

        {/* Content */}
        <View className="flex-1 items-center justify-center px-8">
          {error ? (
            <Animated.View entering={FadeIn} className="items-center">
              <View className="w-24 h-24 bg-red-600/20 rounded-full items-center justify-center mb-6">
                <Ionicons name="alert-circle" size={48} color="#ef4444" />
              </View>
              <Text className="text-white text-xl font-bold text-center mb-2">
                Oops! Something went wrong
              </Text>
              <Text className="text-gray-400 text-center mb-8">{error}</Text>
              <Pressable
                onPress={handleRetry}
                className="bg-green-600 rounded-xl px-8 py-4 flex-row items-center"
              >
                <Ionicons name="refresh" size={20} color="white" />
                <Text className="text-white font-semibold ml-2">Try Again</Text>
              </Pressable>
            </Animated.View>
          ) : generationState.stage === "complete" ? (
            <Animated.View entering={FadeIn} className="items-center">
              <View className="w-24 h-24 bg-green-600/20 rounded-full items-center justify-center mb-6">
                <Ionicons name="checkmark-circle" size={48} color="#22c55e" />
              </View>
              <Text className="text-white text-xl font-bold text-center mb-2">
                Elf Sighting Captured!
              </Text>
              <Text className="text-gray-400 text-center">
                Redirecting to your sighting...
              </Text>
            </Animated.View>
          ) : (
            <View className="items-center">
              {/* Elf Animation */}
              <Animated.View style={elfBounceStyle} className="mb-8">
                <Animated.View
                  style={scaleStyle}
                  className="w-32 h-32 bg-gradient-to-b from-red-600 to-red-800 rounded-full items-center justify-center"
                >
                  <Text className="text-6xl">🎄</Text>
                </Animated.View>
              </Animated.View>

              {/* Loading Spinner */}
              <Animated.View style={rotateStyle} className="mb-8">
                <View className="w-16 h-16 border-4 border-gray-700 border-t-green-500 rounded-full" />
              </Animated.View>

              {/* Progress */}
              <Text className="text-white text-xl font-bold text-center mb-2">
                {generationState.message || "Preparing magic..."}
              </Text>
              <Text className="text-gray-400 text-center mb-6">
                {generationState.progress}% complete
              </Text>

              {/* Progress Bar */}
              <View className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <View
                  className="h-full bg-green-500 rounded-full"
                  style={{ width: `${generationState.progress}%` }}
                />
              </View>

              {mode === "video" && (
                <Text className="text-amber-500 text-xs text-center mt-4">
                  Video generation can take 2-5 minutes
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Scene Preview */}
        {!error && generationState.stage !== "complete" && (
          <View className="px-6 pb-6">
            <Text className="text-gray-500 text-xs text-center mb-2">
              Your scene
            </Text>
            <View className="h-20 rounded-xl overflow-hidden">
              <Image
                source={{ uri: sceneUri }}
                className="w-full h-full"
                resizeMode="cover"
                style={{ opacity: 0.5 }}
              />
            </View>
          </View>
        )}
      </View>
    </View>
  );
}
