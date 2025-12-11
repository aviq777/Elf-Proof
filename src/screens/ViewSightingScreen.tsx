import React from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  ScrollView,
  Share,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { Video, ResizeMode } from "expo-av";
import * as MediaLibrary from "expo-media-library";
import { RootStackParamList } from "../navigation/RootNavigator";
import { useElfStore } from "../state/elfStore";

type RouteProps = RouteProp<RootStackParamList, "ViewSighting">;

export default function ViewSightingScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const route = useRoute<RouteProps>();
  const { sightingId } = route.params;

  const sightings = useElfStore((s) => s.sightings);
  const toggleFavorite = useElfStore((s) => s.toggleFavorite);
  const removeSighting = useElfStore((s) => s.removeSighting);

  const sighting = sightings.find((s) => s.id === sightingId);

  if (!sighting) {
    return (
      <View className="flex-1 bg-[#0a0f1a] items-center justify-center">
        <Text className="text-white text-lg">Sighting not found</Text>
      </View>
    );
  }

  const handleShare = async () => {
    try {
      const uri = sighting.type === "video" ? sighting.videoUri : sighting.compositeImageUri;
      if (uri) {
        await Share.share({
          message: "Check out this elf sighting I caught on camera!",
          url: uri,
        });
      }
    } catch (error) {
      console.log("Share error:", error);
    }
  };

  const handleSaveToGallery = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        return;
      }

      const uri = sighting.type === "video" ? sighting.videoUri : sighting.compositeImageUri;
      if (uri) {
        await MediaLibrary.saveToLibraryAsync(uri);
      }
    } catch (error) {
      console.log("Save error:", error);
    }
  };

  const handleDelete = () => {
    removeSighting(sightingId);
    navigation.goBack();
  };

  const displayDate = new Date(sighting.timestamp).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const displayTime = new Date(sighting.timestamp).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <View className="flex-1 bg-[#0a0f1a]">
      <View style={{ paddingTop: insets.top }} className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-800">
          <Pressable
            onPress={() => navigation.goBack()}
            className="w-10 h-10 items-center justify-center"
          >
            <Ionicons name="chevron-back" size={28} color="white" />
          </Pressable>
          <Text className="text-white text-lg font-semibold">Elf Sighting</Text>
          <Pressable
            onPress={() => toggleFavorite(sightingId)}
            className="w-10 h-10 items-center justify-center"
          >
            <Ionicons
              name={sighting.isFavorite ? "heart" : "heart-outline"}
              size={24}
              color={sighting.isFavorite ? "#ef4444" : "white"}
            />
          </Pressable>
        </View>

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Media Display */}
          <View className="aspect-video bg-black">
            {sighting.type === "video" && sighting.videoUri ? (
              <Video
                source={{ uri: sighting.videoUri }}
                style={{ flex: 1 }}
                resizeMode={ResizeMode.CONTAIN}
                useNativeControls
                isLooping
              />
            ) : sighting.compositeImageUri ? (
              <Image
                source={{ uri: sighting.compositeImageUri }}
                className="w-full h-full"
                resizeMode="contain"
              />
            ) : (
              <View className="flex-1 items-center justify-center">
                <Ionicons name="image" size={48} color="#4b5563" />
              </View>
            )}
          </View>

          {/* Info Section */}
          <View className="p-6">
            {/* Date/Time */}
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 bg-green-600/20 rounded-full items-center justify-center">
                <Ionicons name="calendar" size={20} color="#22c55e" />
              </View>
              <View className="ml-3">
                <Text className="text-white font-semibold">{displayDate}</Text>
                <Text className="text-gray-400 text-sm">{displayTime}</Text>
              </View>
            </View>

            {/* Type Badge */}
            <View className="flex-row items-center mb-6">
              <View className="w-10 h-10 bg-blue-600/20 rounded-full items-center justify-center">
                <Ionicons
                  name={sighting.type === "video" ? "videocam" : "camera"}
                  size={20}
                  color="#3b82f6"
                />
              </View>
              <View className="ml-3">
                <Text className="text-white font-semibold capitalize">
                  {sighting.type} Sighting
                </Text>
                <Text className="text-gray-400 text-sm">
                  {sighting.type === "video" ? "Security camera footage" : "Night vision capture"}
                </Text>
              </View>
            </View>

            {/* Location if available */}
            {sighting.location && (
              <View className="flex-row items-center mb-6">
                <View className="w-10 h-10 bg-amber-600/20 rounded-full items-center justify-center">
                  <Ionicons name="location" size={20} color="#f59e0b" />
                </View>
                <View className="ml-3">
                  <Text className="text-white font-semibold">Location</Text>
                  <Text className="text-gray-400 text-sm">{sighting.location}</Text>
                </View>
              </View>
            )}

            {/* Action Buttons */}
            <View className="flex-row space-x-3 mb-4">
              <Pressable
                onPress={handleShare}
                className="flex-1 bg-[#111827] rounded-xl py-4 flex-row items-center justify-center active:opacity-80"
              >
                <Ionicons name="share-outline" size={20} color="white" />
                <Text className="text-white font-semibold ml-2">Share</Text>
              </Pressable>

              <Pressable
                onPress={handleSaveToGallery}
                className="flex-1 bg-[#111827] rounded-xl py-4 flex-row items-center justify-center active:opacity-80"
              >
                <Ionicons name="download-outline" size={20} color="white" />
                <Text className="text-white font-semibold ml-2">Save</Text>
              </Pressable>
            </View>

            {/* Delete Button */}
            <Pressable
              onPress={handleDelete}
              className="bg-red-600/20 rounded-xl py-4 flex-row items-center justify-center active:opacity-80"
            >
              <Ionicons name="trash-outline" size={20} color="#ef4444" />
              <Text className="text-red-500 font-semibold ml-2">Delete Sighting</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
