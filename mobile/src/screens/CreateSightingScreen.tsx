import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Video, ResizeMode, AVPlaybackStatus } from "expo-av";
import ViewShot from "react-native-view-shot";
import { RootStackParamList } from "../navigation/RootNavigator";
import { useElfStore, USAGE_LIMITS } from "../state/elfStore";
import Slider from "@react-native-community/slider";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, "CreateSighting">;

const MAX_VIDEO_DURATION = 8; // seconds

export default function CreateSightingScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const mode = route.params?.mode || "photo";

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [trimStart, setTrimStart] = useState<number>(0);
  const [showTrimModal, setShowTrimModal] = useState(false);
  const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null);
  const [sceneDescription, setSceneDescription] = useState("");
  const [showCamera, setShowCamera] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const videoRef = useRef<Video>(null);
  const viewShotRef = useRef<ViewShot>(null);

  const setCurrentSceneUri = useElfStore((s) => s.setCurrentSceneUri);
  const photoGenerations = useElfStore((s) => s.photoGenerations);
  const videoGenerations = useElfStore((s) => s.videoGenerations);
  const isPremium = useElfStore((s) => s.isPremium);
  const incrementPhotoGenerations = useElfStore((s) => s.incrementPhotoGenerations);
  const incrementVideoGenerations = useElfStore((s) => s.incrementVideoGenerations);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      setSelectedVideo(null);
      setVideoThumbnail(null);
    }
  };

  const pickVideo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["videos"],
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const duration = (asset.duration || 0) / 1000; // Convert ms to seconds

      setSelectedVideo(asset.uri);
      setSelectedImage(null);
      setVideoDuration(duration);
      setTrimStart(0);
      // Thumbnail will be captured when video loads in the trim modal
      setVideoThumbnail(null);

      // Show trim modal - user will select frame there
      setShowTrimModal(true);
    }
  };

  const openCamera = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) return;
    }
    setShowCamera(true);
  };

  const takePicture = async () => {
    if (cameraRef.current) {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });
      if (photo) {
        setSelectedImage(photo.uri);
        setSelectedVideo(null);
        setShowCamera(false);
      }
    }
  };

  const handleContinue = () => {
    // For video mode, we use the selected image OR video thumbnail as the scene
    const sceneUri = selectedImage || videoThumbnail;

    if (!sceneUri) return;

    // Check usage limits (both free and premium users have limits)
    const isVideoMode = mode === "video";
    const limits = isPremium ? USAGE_LIMITS.premium : USAGE_LIMITS.free;
    const currentUsage = isVideoMode ? videoGenerations : photoGenerations;
    const maxUsage = isVideoMode ? limits.videos : limits.photos;
    const atLimit = currentUsage >= maxUsage;

    if (atLimit) {
      // Show paywall for free users, or show limit reached for premium
      if (!isPremium) {
        navigation.navigate("Paywall");
      } else {
        // Premium user hit their limit - they still see the paywall with a "limit reached" message
        navigation.navigate("Paywall");
      }
      return;
    }

    // Increment usage counter
    if (isVideoMode) {
      incrementVideoGenerations();
    } else {
      incrementPhotoGenerations();
    }

    setCurrentSceneUri(sceneUri);
    navigation.navigate("Generating", {
      sceneUri: sceneUri,
      mode: isVideoMode ? "video" : "image",
      sceneDescription: sceneDescription || undefined,
    });
  };

  const clearSelection = () => {
    setSelectedImage(null);
    setSelectedVideo(null);
    setVideoThumbnail(null);
    setVideoDuration(0);
    setTrimStart(0);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleTrimConfirm = async () => {
    // Capture the current video frame as the thumbnail using ViewShot
    if (viewShotRef.current) {
      try {
        const uri = await viewShotRef.current.capture?.();
        if (uri) {
          setVideoThumbnail(uri);
        }
      } catch (e) {
        console.log("Frame capture failed:", e);
      }
    }
    setShowTrimModal(false);
  };

  const hasSelection = selectedImage || videoThumbnail;

  if (showCamera) {
    return (
      <View className="flex-1 bg-black">
        <CameraView
          ref={cameraRef}
          style={{ flex: 1 }}
          facing="back"
        >
          <View
            className="absolute top-0 left-0 right-0 bottom-0"
            style={{ paddingTop: insets.top }}
          >
            {/* Camera Header */}
            <View className="flex-row items-center justify-between px-4 py-2">
              <Pressable
                onPress={() => setShowCamera(false)}
                className="w-10 h-10 bg-black/50 rounded-full items-center justify-center"
              >
                <Ionicons name="close" size={24} color="white" />
              </Pressable>
              <Text className="text-white font-semibold">
                Capture Your Scene
              </Text>
              <View className="w-10" />
            </View>

            {/* Camera Controls */}
            <View
              className="absolute bottom-0 left-0 right-0 items-center pb-12"
              style={{ paddingBottom: insets.bottom + 20 }}
            >
              <Pressable
                onPress={takePicture}
                className="w-20 h-20 rounded-full border-4 border-white bg-white/20 items-center justify-center active:opacity-70"
              >
                <View className="w-16 h-16 rounded-full bg-white" />
              </Pressable>
            </View>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-[#0a0f1a]"
    >
      <View style={{ paddingTop: insets.top }} className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-800">
          <Pressable
            onPress={() => navigation.goBack()}
            className="w-10 h-10 items-center justify-center"
          >
            <Ionicons name="close" size={28} color="white" />
          </Pressable>
          <Text className="text-white text-lg font-semibold">
            {mode === "video" ? "Create Video Sighting" : "Create Photo Sighting"}
          </Text>
          <View className="w-10" />
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 24 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Instructions */}
          <View className="bg-[#111827] rounded-2xl p-5 mb-6">
            <View className="flex-row items-center mb-3">
              <Ionicons
                name={mode === "video" ? "videocam" : "camera"}
                size={20}
                color="#22c55e"
              />
              <Text className="text-white font-semibold text-base ml-2">
                Step 1: {mode === "video" ? "Upload Scene or Video" : "Upload Your Scene"}
              </Text>
            </View>
            <Text className="text-gray-400 text-sm leading-5">
              {mode === "video"
                ? "Upload a photo or video of where you want the elf to appear. We will use this as the background for the elf animation!"
                : "Take or upload a photo of any room in your house. The elf will be magically added to the scene!"}
            </Text>
          </View>

          {/* Selection Area */}
          {hasSelection ? (
            <View className="mb-6">
              <View className="rounded-2xl overflow-hidden relative">
                <Image
                  source={{ uri: selectedImage || videoThumbnail || "" }}
                  className="w-full aspect-video"
                  resizeMode="cover"
                />
                {selectedVideo && (
                  <View className="absolute top-3 right-3 bg-black/60 px-2 py-1 rounded-full flex-row items-center">
                    <Ionicons name="videocam" size={14} color="white" />
                    <Text className="text-white text-xs ml-1">
                      {videoDuration > MAX_VIDEO_DURATION
                        ? `${formatTime(trimStart)} - ${formatTime(Math.min(trimStart + MAX_VIDEO_DURATION, videoDuration))}`
                        : formatTime(videoDuration)}
                    </Text>
                  </View>
                )}
              </View>

              <View className="flex-row mt-3 space-x-2">
                <Pressable
                  onPress={clearSelection}
                  className="flex-1 flex-row items-center justify-center py-3 bg-gray-800 rounded-xl"
                >
                  <Ionicons name="refresh" size={18} color="#9ca3af" />
                  <Text className="text-gray-400 font-medium ml-2">
                    Change
                  </Text>
                </Pressable>

                {selectedVideo && videoDuration > MAX_VIDEO_DURATION && (
                  <Pressable
                    onPress={() => setShowTrimModal(true)}
                    className="flex-1 flex-row items-center justify-center py-3 bg-amber-600/30 rounded-xl"
                  >
                    <Ionicons name="cut" size={18} color="#f59e0b" />
                    <Text className="text-amber-500 font-medium ml-2">
                      Trim
                    </Text>
                  </Pressable>
                )}
              </View>
            </View>
          ) : (
            <View className="mb-6">
              {mode === "video" ? (
                // Video mode: show photo and video options
                <View className="space-y-3">
                  <View className="flex-row space-x-3">
                    <Pressable
                      onPress={openCamera}
                      className="flex-1 bg-[#111827] rounded-2xl py-6 items-center justify-center border-2 border-dashed border-gray-700 active:border-green-600"
                    >
                      <View className="w-12 h-12 bg-green-600/20 rounded-full items-center justify-center mb-2">
                        <Ionicons name="camera" size={24} color="#22c55e" />
                      </View>
                      <Text className="text-white font-semibold text-sm">Take Photo</Text>
                    </Pressable>

                    <Pressable
                      onPress={pickImage}
                      className="flex-1 bg-[#111827] rounded-2xl py-6 items-center justify-center border-2 border-dashed border-gray-700 active:border-blue-600"
                    >
                      <View className="w-12 h-12 bg-blue-600/20 rounded-full items-center justify-center mb-2">
                        <Ionicons name="images" size={24} color="#3b82f6" />
                      </View>
                      <Text className="text-white font-semibold text-sm">Upload Photo</Text>
                    </Pressable>
                  </View>

                  <Pressable
                    onPress={pickVideo}
                    className="bg-[#111827] rounded-2xl py-6 items-center justify-center border-2 border-dashed border-gray-700 active:border-red-600"
                  >
                    <View className="w-12 h-12 bg-red-600/20 rounded-full items-center justify-center mb-2">
                      <Ionicons name="videocam" size={24} color="#ef4444" />
                    </View>
                    <Text className="text-white font-semibold text-sm">Upload Video</Text>
                    <Text className="text-gray-500 text-xs mt-1">
                      Videos over 8s will be trimmed
                    </Text>
                  </Pressable>
                </View>
              ) : (
                // Photo mode: just photo options
                <View className="flex-row space-x-3">
                  <Pressable
                    onPress={openCamera}
                    className="flex-1 bg-[#111827] rounded-2xl py-8 items-center justify-center border-2 border-dashed border-gray-700 active:border-green-600"
                  >
                    <View className="w-14 h-14 bg-green-600/20 rounded-full items-center justify-center mb-3">
                      <Ionicons name="camera" size={28} color="#22c55e" />
                    </View>
                    <Text className="text-white font-semibold">Take Photo</Text>
                    <Text className="text-gray-500 text-xs mt-1">
                      Use camera
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={pickImage}
                    className="flex-1 bg-[#111827] rounded-2xl py-8 items-center justify-center border-2 border-dashed border-gray-700 active:border-green-600"
                  >
                    <View className="w-14 h-14 bg-blue-600/20 rounded-full items-center justify-center mb-3">
                      <Ionicons name="images" size={28} color="#3b82f6" />
                    </View>
                    <Text className="text-white font-semibold">Upload</Text>
                    <Text className="text-gray-500 text-xs mt-1">
                      From gallery
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
          )}

          {/* Scene Description */}
          <View className="bg-[#111827] rounded-2xl p-5 mb-6">
            <View className="flex-row items-center mb-3">
              <Ionicons name="text" size={20} color="#22c55e" />
              <Text className="text-white font-semibold text-base ml-2">
                Step 2: Describe the Scene (Optional)
              </Text>
            </View>
            <Text className="text-gray-400 text-sm mb-4">
              Help us understand your scene for better elf placement
            </Text>
            <TextInput
              value={sceneDescription}
              onChangeText={setSceneDescription}
              placeholder="e.g., Kitchen counter with cookies and milk"
              placeholderTextColor="#6b7280"
              className="bg-[#1f2937] rounded-xl px-4 py-3 text-white text-base"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Generate Button */}
          <Pressable
            onPress={handleContinue}
            disabled={!hasSelection}
            className={`rounded-2xl py-4 flex-row items-center justify-center ${
              hasSelection ? "bg-green-600 active:opacity-80" : "bg-gray-700"
            }`}
          >
            <Ionicons
              name="sparkles"
              size={20}
              color={hasSelection ? "white" : "#9ca3af"}
            />
            <Text
              className={`font-bold text-lg ml-2 ${
                hasSelection ? "text-white" : "text-gray-400"
              }`}
            >
              {mode === "video" ? "Generate Video" : "Generate Sighting"}
            </Text>
          </Pressable>

          {mode === "video" && (
            <Text className="text-amber-500 text-xs text-center mt-3">
              Video generation takes 2-5 minutes
            </Text>
          )}
        </ScrollView>
      </View>

      {/* Video Trim Modal */}
      <Modal
        visible={showTrimModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowTrimModal(false)}
      >
        <View className="flex-1 bg-[#0a0f1a]">
          <View style={{ paddingTop: insets.top }} className="flex-1">
            {/* Modal Header */}
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-800">
              <Pressable
                onPress={() => setShowTrimModal(false)}
                className="w-10 h-10 items-center justify-center"
              >
                <Ionicons name="close" size={24} color="white" />
              </Pressable>
              <Text className="text-white text-lg font-semibold">
                Trim Video
              </Text>
              <Pressable
                onPress={handleTrimConfirm}
                className="px-4 py-2"
              >
                <Text className="text-green-500 font-semibold">Done</Text>
              </Pressable>
            </View>

            {/* Video Preview */}
            <View className="flex-1 justify-center px-6">
              <ViewShot ref={viewShotRef} options={{ format: "jpg", quality: 0.8 }}>
                <View className="bg-black rounded-2xl overflow-hidden aspect-video mb-6">
                  {selectedVideo && (
                    <Video
                      ref={videoRef}
                      source={{ uri: selectedVideo }}
                      style={{ flex: 1 }}
                      resizeMode={ResizeMode.CONTAIN}
                      positionMillis={trimStart * 1000}
                      shouldPlay={false}
                      isLooping={false}
                    />
                  )}
                </View>
              </ViewShot>

              {/* Trim Info */}
              <View className="bg-[#111827] rounded-2xl p-5 mb-6">
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-gray-400">Video Duration</Text>
                  <Text className="text-white font-semibold">
                    {formatTime(videoDuration)}
                  </Text>
                </View>
                <View className="flex-row items-center justify-between mb-4">
                  <Text className="text-gray-400">Selected Section</Text>
                  <Text className="text-green-500 font-semibold">
                    {formatTime(trimStart)} - {formatTime(Math.min(trimStart + MAX_VIDEO_DURATION, videoDuration))}
                  </Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-gray-400">Output Duration</Text>
                  <Text className="text-white font-semibold">
                    {formatTime(Math.min(MAX_VIDEO_DURATION, videoDuration - trimStart))}
                  </Text>
                </View>
              </View>

              {/* Trim Slider */}
              <View className="bg-[#111827] rounded-2xl p-5">
                <Text className="text-white font-semibold mb-4">
                  Select Start Point
                </Text>
                <Slider
                  style={{ width: "100%", height: 40 }}
                  minimumValue={0}
                  maximumValue={Math.max(0, videoDuration - MAX_VIDEO_DURATION)}
                  value={trimStart}
                  onValueChange={setTrimStart}
                  minimumTrackTintColor="#22c55e"
                  maximumTrackTintColor="#374151"
                  thumbTintColor="#22c55e"
                />
                <View className="flex-row justify-between mt-2">
                  <Text className="text-gray-500 text-xs">
                    {formatTime(0)}
                  </Text>
                  <Text className="text-gray-500 text-xs">
                    {formatTime(Math.max(0, videoDuration - MAX_VIDEO_DURATION))}
                  </Text>
                </View>

                <Text className="text-gray-400 text-xs text-center mt-4">
                  The elf video will use the first frame of your selected section as the scene background
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
