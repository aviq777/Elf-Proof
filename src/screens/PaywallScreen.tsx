import React from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { RootStackParamList } from "../navigation/RootNavigator";
import { useElfStore } from "../state/elfStore";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const FREE_PHOTO_LIMIT = 2;
const FREE_VIDEO_LIMIT = 1;

export default function PaywallScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const setPremium = useElfStore((s) => s.setPremium);

  const handleRestore = () => {
    // RevenueCat restore logic would go here
    // For now, show that RevenueCat needs to be connected
  };

  const handleSubscribe = () => {
    // RevenueCat purchase logic would go here
    // For now, this is a placeholder
  };

  return (
    <View className="flex-1 bg-[#0a0f1a]">
      <LinearGradient
        colors={["#064e3b", "#0a0f1a", "#0a0f1a"]}
        locations={[0, 0.4, 1]}
        style={{ flex: 1 }}
      >
        {/* Header with close button */}
        <View
          style={{ paddingTop: insets.top }}
          className="flex-row justify-end px-4 pt-2"
        >
          <Pressable
            onPress={() => navigation.goBack()}
            className="w-8 h-8 bg-white/10 rounded-full items-center justify-center"
          >
            <Ionicons name="close" size={20} color="white" />
          </Pressable>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section */}
          <View className="items-center mt-8 mb-10">
            <View className="w-24 h-24 bg-green-500/20 rounded-3xl items-center justify-center mb-6">
              <Text className="text-5xl">🎄</Text>
            </View>
            <Text className="text-white text-3xl font-bold text-center mb-3">
              Unlock Unlimited Magic
            </Text>
            <Text className="text-gray-400 text-base text-center leading-6">
              Create unlimited elf sightings and make this Christmas truly magical
            </Text>
          </View>

          {/* Features List */}
          <View className="bg-white/5 rounded-2xl p-6 mb-8">
            <FeatureItem
              icon="infinite"
              title="Unlimited Photo Sightings"
              description={`Free users get ${FREE_PHOTO_LIMIT} photos`}
            />
            <FeatureItem
              icon="videocam"
              title="Unlimited Video Sightings"
              description={`Free users get ${FREE_VIDEO_LIMIT} video`}
            />
            <FeatureItem
              icon="sparkles"
              title="Priority Generation"
              description="Faster processing for your creations"
            />
            <FeatureItem
              icon="star"
              title="Premium Support"
              description="Get help when you need it"
              isLast
            />
          </View>

          {/* Pricing */}
          <View className="items-center mb-8">
            <Text className="text-gray-500 text-sm mb-2">
              Limited Time Holiday Offer
            </Text>
            <View className="flex-row items-baseline">
              <Text className="text-white text-4xl font-bold">$4.99</Text>
              <Text className="text-gray-400 text-base ml-2">/ lifetime</Text>
            </View>
            <Text className="text-green-500 text-sm mt-2">
              One-time purchase, no subscription
            </Text>
          </View>

          {/* Subscribe Button */}
          <Pressable
            onPress={handleSubscribe}
            className="bg-green-600 rounded-2xl py-4 mb-4 active:opacity-80"
          >
            <Text className="text-white text-lg font-bold text-center">
              Unlock Premium
            </Text>
          </Pressable>

          {/* Restore Button */}
          <Pressable
            onPress={handleRestore}
            className="py-3 mb-6"
          >
            <Text className="text-gray-400 text-base text-center">
              Restore Purchase
            </Text>
          </Pressable>

          {/* Info Notice */}
          <View className="bg-amber-500/10 rounded-xl p-4 mb-4">
            <View className="flex-row items-start">
              <Ionicons name="information-circle" size={20} color="#f59e0b" />
              <Text className="text-amber-500 text-sm ml-2 flex-1">
                To enable purchases, please set up RevenueCat in the Payments tab of the Vibecode app.
              </Text>
            </View>
          </View>

          {/* Terms */}
          <Text className="text-gray-600 text-xs text-center leading-5">
            By purchasing, you agree to our Terms of Service and Privacy Policy.
            Payment will be charged to your Apple ID account.
          </Text>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

interface FeatureItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  isLast?: boolean;
}

function FeatureItem({ icon, title, description, isLast }: FeatureItemProps) {
  return (
    <View
      className={`flex-row items-center ${isLast ? "" : "mb-5 pb-5 border-b border-white/10"}`}
    >
      <View className="w-10 h-10 bg-green-500/20 rounded-full items-center justify-center">
        <Ionicons name={icon} size={20} color="#22c55e" />
      </View>
      <View className="ml-4 flex-1">
        <Text className="text-white font-semibold text-base">{title}</Text>
        <Text className="text-gray-500 text-sm">{description}</Text>
      </View>
      <Ionicons name="checkmark-circle" size={22} color="#22c55e" />
    </View>
  );
}
