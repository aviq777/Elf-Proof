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
import { useElfStore } from "../state/elfStore";
import {
  isRevenueCatEnabled,
  hasEntitlement,
  restorePurchases,
} from "../lib/revenuecatClient";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

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
                <View className="w-32 h-32 bg-[#1f2937] rounded-2xl items-center justify-center border-2 border-dashed border-gray-600">
                  <Text className="text-4xl mb-2">🧝</Text>
                  <Text className="text-gray-500 text-xs">No photo</Text>
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
            <View className="flex-row items-center mb-4">
              <Ionicons name="star" size={20} color="#f59e0b" />
              <Text className="text-white font-semibold text-base ml-2">
                Premium Status
              </Text>
            </View>

            {isPremium ? (
              <View className="bg-green-600/20 rounded-xl p-4 flex-row items-center">
                <Ionicons name="checkmark-circle" size={24} color="#22c55e" />
                <View className="ml-3">
                  <Text className="text-green-500 font-semibold">Premium Active</Text>
                  <Text className="text-gray-400 text-sm">Unlimited sightings</Text>
                </View>
              </View>
            ) : (
              <>
                <View className="bg-gray-800 rounded-xl p-4 mb-3">
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-gray-400">Photos used</Text>
                    <Text className="text-white font-semibold">{photoGenerations} / 2</Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-gray-400">Videos used</Text>
                    <Text className="text-white font-semibold">{videoGenerations} / 1</Text>
                  </View>
                </View>

                <Pressable
                  onPress={handleUpgradeToPremium}
                  className="bg-green-600 rounded-xl py-3 flex-row items-center justify-center active:opacity-80"
                >
                  <Ionicons name="sparkles" size={18} color="white" />
                  <Text className="text-white font-semibold ml-2">Upgrade to Premium</Text>
                </Pressable>
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
              Elf Proof v1.0.0
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
