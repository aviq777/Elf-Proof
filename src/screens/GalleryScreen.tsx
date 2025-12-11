import React from "react";
import { View, Text, Pressable, FlatList, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "../navigation/RootNavigator";
import { useElfStore } from "../state/elfStore";
import { ElfSighting } from "../types/elf";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function GalleryScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const sightings = useElfStore((s) => s.sightings);

  const renderSighting = ({ item }: { item: ElfSighting }) => {
    const displayUri = item.type === "video" ? item.sceneImageUri : item.compositeImageUri;

    return (
      <Pressable
        onPress={() => navigation.navigate("ViewSighting", { sightingId: item.id })}
        className="flex-1 m-1 rounded-xl overflow-hidden bg-[#111827] active:opacity-80"
        style={{ aspectRatio: 1 }}
      >
        {displayUri ? (
          <Image
            source={{ uri: displayUri }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full items-center justify-center">
            <Ionicons name="image" size={32} color="#4b5563" />
          </View>
        )}

        {/* Type Badge */}
        <View className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded-full flex-row items-center">
          <Ionicons
            name={item.type === "video" ? "videocam" : "camera"}
            size={12}
            color="white"
          />
          <Text className="text-white text-xs ml-1 capitalize">{item.type}</Text>
        </View>

        {/* Favorite Badge */}
        {item.isFavorite && (
          <View className="absolute top-2 right-2">
            <Ionicons name="heart" size={18} color="#ef4444" />
          </View>
        )}

        {/* Timestamp */}
        <View className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
          <Text className="text-white text-xs">
            {new Date(item.timestamp).toLocaleDateString()}
          </Text>
        </View>
      </Pressable>
    );
  };

  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-8">
      <View className="w-24 h-24 bg-[#111827] rounded-full items-center justify-center mb-6">
        <Text className="text-5xl">🎄</Text>
      </View>
      <Text className="text-white text-xl font-bold text-center mb-2">
        No Elf Sightings Yet
      </Text>
      <Text className="text-gray-400 text-center text-base mb-8">
        Create your first elf sighting to start building your collection of
        magical moments!
      </Text>
      <Pressable
        onPress={() => navigation.navigate("CreateSighting", { mode: "photo" })}
        className="bg-green-600 rounded-xl px-8 py-4 flex-row items-center active:opacity-80"
      >
        <Ionicons name="add" size={20} color="white" />
        <Text className="text-white font-semibold text-base ml-2">
          Create First Sighting
        </Text>
      </Pressable>
    </View>
  );

  return (
    <View className="flex-1 bg-[#0a0f1a]">
      <View style={{ paddingTop: insets.top }} className="flex-1">
        {/* Header */}
        <View className="px-6 pt-4 pb-4 flex-row items-center justify-between">
          <View>
            <Text className="text-white text-3xl font-bold">Gallery</Text>
            <Text className="text-gray-400 text-base mt-1">
              {sightings.length} {sightings.length === 1 ? "sighting" : "sightings"}
            </Text>
          </View>

          {sightings.length > 0 && (
            <Pressable
              onPress={() => navigation.navigate("CreateSighting", { mode: "photo" })}
              className="w-12 h-12 bg-green-600 rounded-full items-center justify-center"
            >
              <Ionicons name="add" size={24} color="white" />
            </Pressable>
          )}
        </View>

        {sightings.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={sightings}
            renderItem={renderSighting}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={{ padding: 16 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
}
