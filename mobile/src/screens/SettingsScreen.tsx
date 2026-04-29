import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { RootStackParamList } from "../navigation/RootNavigator";
import { useElfStore, USAGE_LIMITS } from "../state/elfStore";
import {
  isRevenueCatEnabled,
  hasEntitlement,
  restorePurchases,
} from "../lib/revenuecatClient";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Default elf image
const DEFAULT_ELF_IMAGE = require("../../assets/image-1765482401.jpeg");

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();

  const elfSettings = useElfStore((s) => s.elfSettings);
  const setElfSettings = useElfStore((s) => s.setElfSettings);
  const isPremium = useElfStore((s) => s.isPremium);
  const setPremium = useElfStore((s) => s.setPremium);
  const photoGenerations = useElfStore((s) => s.photoGenerations);
  const videoGenerations = useElfStore((s) => s.videoGenerations);

  const [elfName, setElfName] = useState(elfSettings.name);
  const [isRestoring, setIsRestoring] = useState(false);

  const handlePickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setElfSettings({ photoUri: result.assets[0].uri });
    }
  };

  const handleTakePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setElfSettings({ photoUri: result.assets[0].uri });
    }
  };

  const handleSaveName = () => {
    if (elfName.trim()) {
      setElfSettings({ name: elfName.trim() });
    }
  };

  const handleRemovePhoto = () => {
    setElfSettings({ photoUri: null });
  };

  const handleRestorePurchases = async () => {
    setIsRestoring(true);
    const result = await restorePurchases();
    if (result.ok) {
      const premiumResult = await hasEntitlement("premium");
      if (premiumResult.ok && premiumResult.data) {
        setPremium(true);
      }
    }
    setIsRestoring(false);
  };

  const handleUpgradeToPremium = () => {
    navigation.navigate("Paywall");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-[#0a0f1a]"
    >
      <View style={{ paddingTop: insets.top }} className="flex-1">
        {/* Header */}
        <View className="px-6 pt-4 pb-6">
          <Text className="text-white text-3xl font-bold">Settings</Text>
          <Text className="text-gray-400 text-base mt-1">
            Customize your elf
          </Text>
        </View>

        <ScrollView
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Elf Photo Section */}
          <View className="bg-[#111827] rounded-2xl p-5 mb-4">
            <View className="flex-row items-center mb-4">
              <Ionicons name="image" size={20} color="#22c55e" />
              <Text className="text-white font-semibold text-base ml-2">
                Your Elf Photo
              </Text>
            </View>

            <View className="items-center mb-4">
              {elfSettings.photoUri ? (
                <View className="relative">
                  <Image
                    source={{ uri: elfSettings.photoUri }}
                    className="w-32 h-32 rounded-2xl"
                  />
                  <Pressable
                    onPress={handleRemovePhoto}
                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full items-center justify-center"
                  >
                    <Ionicons name="close" size={18} color="white" />
                  </Pressable>
                </View>
              ) : (
                <View className="w-32 h-32 rounded-2xl overflow-hidden border-2 border-dashed border-gray-600">
                  <Image
                    source={DEFAULT_ELF_IMAGE}
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </View>
              )}
            </View>

            <Text className="text-gray-400 text-sm text-center mb-4">
              Upload a photo of your elf for AI to reference when generating sightings
            </Text>

            <View className="flex-row space-x-3">
              <Pressable
                onPress={handleTakePhoto}
                className="flex-1 bg-green-600/20 rounded-xl py-3 flex-row items-center justify-center active:opacity-80"
              >
                <Ionicons name="camera" size={18} color="#22c55e" />
                <Text className="text-green-500 font-semibold ml-2">Camera</Text>
              </Pressable>

              <Pressable
                onPress={handlePickPhoto}
                className="flex-1 bg-blue-600/20 rounded-xl py-3 flex-row items-center justify-center active:opacity-80"
              >
                <Ionicons name="images" size={18} color="#3b82f6" />
                <Text className="text-blue-500 font-semibold ml-2">Gallery</Text>
              </Pressable>
            </View>
          </View>

          {/* Elf Name Section */}
          <View className="bg-[#111827] rounded-2xl p-5 mb-4">
            <View className="flex-row items-center mb-4">
              <Ionicons name="text" size={20} color="#22c55e" />
              <Text className="text-white font-semibold text-base ml-2">
                Elf Name
              </Text>
            </View>

            <View className="flex-row items-center space-x-3">
              <TextInput
                value={elfName}
                onChangeText={setElfName}
                onBlur={handleSaveName}
                placeholder="Enter your elf's name"
                placeholderTextColor="#6b7280"
                className="flex-1 bg-[#1f2937] rounded-xl px-4 py-3 text-white text-base"
                maxLength={20}
              />
              <Pressable
                onPress={handleSaveName}
                className="bg-green-600 rounded-xl px-4 py-3 active:opacity-80"
              >
                <Ionicons name="checkmark" size={20} color="white" />
              </Pressable>
            </View>

            <Text className="text-gray-500 text-xs mt-2">
              Current name: {elfSettings.name}
            </Text>
          </View>

          {/* Premium Status */}
          <View className="bg-[#111827] rounded-2xl p-5 mb-4">
            {isPremium ? (
              <>
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center">
                    <Ionicons name="star" size={20} color="#22c55e" />
                    <Text className="text-white font-semibold text-base ml-2">
                      Your Plan
                    </Text>
                  </View>
                  <View className="bg-green-600 px-3 py-1 rounded-full">
                    <Text className="text-white font-bold text-xs">PREMIUM</Text>
                  </View>
                </View>

                <View className="bg-green-600/10 rounded-xl p-4 border border-green-600/30">
                  <View className="flex-row items-center mb-3">
                    <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
                    <Text className="text-green-500 font-semibold text-lg ml-2">Premium Member</Text>
                  </View>

                  <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-400">Photos remaining</Text>
                    <Text className="text-white font-semibold">
                      {Math.max(0, USAGE_LIMITS.premium.photos - photoGenerations)} / {USAGE_LIMITS.premium.photos}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-gray-400">Videos remaining</Text>
                    <Text className="text-white font-semibold">
                      {Math.max(0, USAGE_LIMITS.premium.videos - videoGenerations)} / {USAGE_LIMITS.premium.videos}
                    </Text>
                  </View>
                </View>
              </>
            ) : (
              <>
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center">
                    <Ionicons name="star-outline" size={20} color="#6b7280" />
                    <Text className="text-white font-semibold text-base ml-2">
                      Your Plan
                    </Text>
                  </View>
                  <View className="bg-gray-600 px-3 py-1 rounded-full">
                    <Text className="text-white font-bold text-xs">FREE</Text>
                  </View>
                </View>

                {/* Usage Progress */}
                <View className="bg-gray-800 rounded-xl p-4 mb-4">
                  <Text className="text-white font-semibold mb-3">Your Free Usage</Text>

                  {/* Photos Progress */}
                  <View className="mb-3">
                    <View className="flex-row justify-between mb-1">
                      <Text className="text-gray-400 text-sm">Photos</Text>
                      <Text className="text-white font-semibold text-sm">
                        {photoGenerations} / {USAGE_LIMITS.free.photos} used
                      </Text>
                    </View>
                    <View className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <View
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(100, (photoGenerations / USAGE_LIMITS.free.photos) * 100)}%`,
                          backgroundColor: photoGenerations >= USAGE_LIMITS.free.photos ? "#ef4444" : "#22c55e"
                        }}
                      />
                    </View>
                  </View>

                  {/* Videos Progress */}
                  <View>
                    <View className="flex-row justify-between mb-1">
                      <Text className="text-gray-400 text-sm">Videos</Text>
                      <Text className="text-white font-semibold text-sm">
                        {videoGenerations} / {USAGE_LIMITS.free.videos} used
                      </Text>
                    </View>
                    <View className="h-2 bg-gray-700 rounded-full overflow-hidden">
                      <View
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(100, (videoGenerations / USAGE_LIMITS.free.videos) * 100)}%`,
                          backgroundColor: videoGenerations >= USAGE_LIMITS.free.videos ? "#ef4444" : "#22c55e"
                        }}
                      />
                    </View>
                  </View>
                </View>

                {/* Warning if at or near limit */}
                {(photoGenerations >= USAGE_LIMITS.free.photos || videoGenerations >= USAGE_LIMITS.free.videos) ? (
                  <View className="bg-red-500/10 rounded-xl p-4 mb-4 border border-red-500/30">
                    <View className="flex-row items-center mb-2">
                      <Ionicons name="warning" size={20} color="#ef4444" />
                      <Text className="text-red-400 font-semibold ml-2">Limit Reached</Text>
                    </View>
                    <Text className="text-red-300 text-sm">
                      {"You've used all your free generations. Upgrade to Premium to continue creating elf sightings!"}
                    </Text>
                  </View>
                ) : (
                  <View className="bg-amber-500/10 rounded-xl p-4 mb-4 border border-amber-500/30">
                    <View className="flex-row items-center mb-2">
                      <Ionicons name="gift" size={20} color="#f59e0b" />
                      <Text className="text-amber-400 font-semibold ml-2">Free Trial</Text>
                    </View>
                    <Text className="text-amber-200 text-sm">
                      You get {USAGE_LIMITS.free.photos} free photos and {USAGE_LIMITS.free.videos} free video. After that, upgrade to Premium for {USAGE_LIMITS.premium.photos} photos and {USAGE_LIMITS.premium.videos} videos!
                    </Text>
                  </View>
                )}

                {/* Upgrade Button */}
                <Pressable
                  onPress={handleUpgradeToPremium}
                  className="bg-green-600 rounded-xl py-4 flex-row items-center justify-center active:opacity-80"
                >
                  <Ionicons name="sparkles" size={20} color="white" />
                  <Text className="text-white font-bold text-base ml-2">Upgrade to Premium</Text>
                </Pressable>

                <Text className="text-gray-500 text-xs text-center mt-3">
                  One-time purchase of $4.99 - No subscription
                </Text>
              </>
            )}
          </View>

          {/* Restore Purchases */}
          {isRevenueCatEnabled() && (
            <View className="bg-[#111827] rounded-2xl p-5 mb-4">
              <Pressable
                onPress={handleRestorePurchases}
                disabled={isRestoring}
                className="flex-row items-center justify-center py-2"
              >
                {isRestoring ? (
                  <Text className="text-gray-400">Restoring...</Text>
                ) : (
                  <>
                    <Ionicons name="refresh" size={18} color="#9ca3af" />
                    <Text className="text-gray-400 ml-2">Restore Purchases</Text>
                  </>
                )}
              </Pressable>
            </View>
          )}

          {/* App Info */}
          <View className="bg-[#111827] rounded-2xl p-5 mb-8">
            <View className="flex-row items-center mb-3">
              <Ionicons name="information-circle" size={20} color="#6b7280" />
              <Text className="text-gray-400 font-semibold text-base ml-2">
                About
              </Text>
            </View>
            <Text className="text-gray-500 text-sm">
              Elf Watcher v1.0.0
            </Text>
            <Text className="text-gray-600 text-xs mt-1">
              Catch your elf in action with AI-powered magic
            </Text>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
