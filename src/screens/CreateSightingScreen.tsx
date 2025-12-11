import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { CameraView, useCameraPermissions } from "expo-camera";
import { RootStackParamList } from "../navigation/RootNavigator";
import { useElfStore } from "../state/elfStore";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;
type RouteProps = RouteProp<RootStackParamList, "CreateSighting">;

export default function CreateSightingScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const mode = route.params?.mode || "photo";

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [sceneDescription, setSceneDescription] = useState("");
  const [showCamera, setShowCamera] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  const setCurrentSceneUri = useElfStore((s) => s.setCurrentSceneUri);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
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
        setShowCamera(false);
      }
    }
  };

  const handleContinue = () => {
    if (selectedImage) {
      setCurrentSceneUri(selectedImage);
      navigation.navigate("Generating", {
        sceneUri: selectedImage,
        mode: mode === "video" ? "video" : "image",
        sceneDescription: sceneDescription || undefined,
      });
    }
  };

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
                Step 1: Upload Your Scene
              </Text>
            </View>
            <Text className="text-gray-400 text-sm leading-5">
              {mode === "video"
                ? "Upload a photo of where you want the elf to appear. We'll generate a video of the elf moving through the scene!"
                : "Take or upload a photo of any room in your house. The elf will be magically added to the scene!"}
            </Text>
          </View>

          {/* Image Selection Area */}
          {selectedImage ? (
            <View className="mb-6">
              <View className="rounded-2xl overflow-hidden">
                <Image
                  source={{ uri: selectedImage }}
                  className="w-full aspect-video"
                  resizeMode="cover"
                />
              </View>
              <Pressable
                onPress={() => setSelectedImage(null)}
                className="mt-3 flex-row items-center justify-center py-3 bg-gray-800 rounded-xl"
              >
                <Ionicons name="refresh" size={18} color="#9ca3af" />
                <Text className="text-gray-400 font-medium ml-2">
                  Choose Different Photo
                </Text>
              </Pressable>
            </View>
          ) : (
            <View className="mb-6">
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
            disabled={!selectedImage}
            className={`rounded-2xl py-4 flex-row items-center justify-center ${
              selectedImage ? "bg-green-600 active:opacity-80" : "bg-gray-700"
            }`}
          >
            <Ionicons
              name="sparkles"
              size={20}
              color={selectedImage ? "white" : "#9ca3af"}
            />
            <Text
              className={`font-bold text-lg ml-2 ${
                selectedImage ? "text-white" : "text-gray-400"
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
    </KeyboardAvoidingView>
  );
}
