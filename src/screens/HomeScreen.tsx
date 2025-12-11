import React from "react";
import { View, Text, Pressable, ImageBackground } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "../navigation/RootNavigator";
import { useElfStore } from "../state/elfStore";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const sightingsCount = useElfStore((s) => s.sightings.length);

  return (
    <View className="flex-1 bg-[#0a0f1a]">
      <View style={{ paddingTop: insets.top }} className="flex-1">
        {/* Header */}
        <View className="px-6 pt-4 pb-6">
          <Text className="text-white text-3xl font-bold">Elf Sightings</Text>
          <Text className="text-gray-400 text-base mt-1">
            Catch your elf in action
          </Text>
        </View>

        {/* Main Content */}
        <View className="flex-1 px-6">
          {/* Hero Card */}
          <View className="bg-[#111827] rounded-3xl overflow-hidden mb-6">
            <LinearGradient
              colors={["#064e3b", "#0a0f1a"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                padding: 24,
                borderRadius: 24,
              }}
            >
              <View className="flex-row items-center mb-4">
                <View className="w-12 h-12 bg-green-500/20 rounded-full items-center justify-center">
                  <Text className="text-2xl">🎄</Text>
                </View>
                <View className="ml-4 flex-1">
                  <Text className="text-white text-xl font-bold">
                    Create Elf Sighting
                  </Text>
                  <Text className="text-gray-400 text-sm">
                    Upload a scene from your home
                  </Text>
                </View>
              </View>
              <Text className="text-gray-300 text-sm leading-5 mb-6">
                Take or upload a photo of any room in your house, and watch as
                your elf magically appears in the scene like security camera
                footage!
              </Text>

              {/* Action Buttons */}
              <View className="flex-row space-x-3">
                <Pressable
                  onPress={() => navigation.navigate("CreateSighting", { mode: "photo" })}
                  className="flex-1 bg-green-600 rounded-xl py-4 flex-row items-center justify-center active:opacity-80"
                >
                  <Ionicons name="camera" size={20} color="white" />
                  <Text className="text-white font-semibold text-base ml-2">
                    Photo
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => navigation.navigate("CreateSighting", { mode: "video" })}
                  className="flex-1 bg-red-600 rounded-xl py-4 flex-row items-center justify-center active:opacity-80"
                >
                  <Ionicons name="videocam" size={20} color="white" />
                  <Text className="text-white font-semibold text-base ml-2">
                    Video
                  </Text>
                </Pressable>
              </View>
            </LinearGradient>
          </View>

          {/* Stats Cards */}
          <View className="flex-row space-x-4 mb-6">
            <View className="flex-1 bg-[#111827] rounded-2xl p-5">
              <View className="w-10 h-10 bg-blue-500/20 rounded-full items-center justify-center mb-3">
                <Ionicons name="eye" size={20} color="#3b82f6" />
              </View>
              <Text className="text-white text-2xl font-bold">
                {sightingsCount}
              </Text>
              <Text className="text-gray-400 text-sm">Total Sightings</Text>
            </View>

            <View className="flex-1 bg-[#111827] rounded-2xl p-5">
              <View className="w-10 h-10 bg-amber-500/20 rounded-full items-center justify-center mb-3">
                <Text className="text-lg">🎅</Text>
              </View>
              <Text className="text-white text-2xl font-bold">
                {Math.max(0, Math.floor((new Date("2025-12-25").getTime() - Date.now()) / (1000 * 60 * 60 * 24)))}
              </Text>
              <Text className="text-gray-400 text-sm">Days to Christmas</Text>
            </View>
          </View>

          {/* Tips Card */}
          <View className="bg-[#111827] rounded-2xl p-5">
            <View className="flex-row items-center mb-3">
              <Ionicons name="bulb" size={20} color="#fbbf24" />
              <Text className="text-white font-semibold text-base ml-2">
                Pro Tips
              </Text>
            </View>
            <View className="space-y-2">
              <View className="flex-row items-start">
                <Text className="text-green-500 mr-2">•</Text>
                <Text className="text-gray-400 text-sm flex-1">
                  Take photos in dim lighting for the best security cam effect
                </Text>
              </View>
              <View className="flex-row items-start">
                <Text className="text-green-500 mr-2">•</Text>
                <Text className="text-gray-400 text-sm flex-1">
                  Include everyday objects for scale reference
                </Text>
              </View>
              <View className="flex-row items-start">
                <Text className="text-green-500 mr-2">•</Text>
                <Text className="text-gray-400 text-sm flex-1">
                  Videos take longer but look more convincing!
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}
