import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { PurchasesPackage } from "react-native-purchases";
import { RootStackParamList } from "../navigation/RootNavigator";
import { useElfStore, USAGE_LIMITS } from "../state/elfStore";
import {
  getOfferings,
  purchasePackage,
  restorePurchases,
  hasEntitlement,
  isRevenueCatEnabled,
} from "../lib/revenuecatClient";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function PaywallScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const setPremium = useElfStore((s) => s.setPremium);
  const isPremium = useElfStore((s) => s.isPremium);
  const photoGenerations = useElfStore((s) => s.photoGenerations);
  const videoGenerations = useElfStore((s) => s.videoGenerations);

  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [lifetimePackage, setLifetimePackage] = useState<PurchasesPackage | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check if premium user has hit their limits
  const premiumPhotosRemaining = USAGE_LIMITS.premium.photos - photoGenerations;
  const premiumVideosRemaining = USAGE_LIMITS.premium.videos - videoGenerations;
  const isPremiumAtLimit = isPremium && (premiumPhotosRemaining <= 0 || premiumVideosRemaining <= 0);

  useEffect(() => {
    loadOfferings();
  }, []);

  const loadOfferings = async () => {
    setIsLoading(true);
    setError(null);

    const result = await getOfferings();

    if (result.ok && result.data.current) {
      const pkg = result.data.current.availablePackages.find(
        (p: PurchasesPackage) => p.identifier === "$rc_lifetime"
      );
      setLifetimePackage(pkg || null);
    } else if (!result.ok) {
      if (result.reason === "not_configured") {
        setError("Payments not configured yet");
      } else if (result.reason === "web_not_supported") {
        setError("Please use the mobile app to purchase");
      }
    }

    setIsLoading(false);
  };

  const checkAndUpdatePremiumStatus = async () => {
    const premiumResult = await hasEntitlement("premium");
    if (premiumResult.ok && premiumResult.data) {
      setPremium(true);
      navigation.goBack();
      return true;
    }
    return false;
  };

  const handleRestore = async () => {
    setIsRestoring(true);
    setError(null);

    const result = await restorePurchases();

    if (result.ok) {
      const hasPremium = await checkAndUpdatePremiumStatus();
      if (!hasPremium) {
        setError("No purchases found to restore");
      }
    } else {
      setError("Failed to restore purchases");
    }

    setIsRestoring(false);
  };

  const handleSubscribe = async () => {
    if (!lifetimePackage) return;

    setIsPurchasing(true);
    setError(null);

    const result = await purchasePackage(lifetimePackage);

    if (result.ok) {
      await checkAndUpdatePremiumStatus();
    } else {
      if (result.reason === "sdk_error") {
        // User likely cancelled - don't show error
      } else {
        setError("Purchase failed. Please try again.");
      }
    }

    setIsPurchasing(false);
  };

  const price = lifetimePackage?.product?.priceString || "$4.99";
  const isConfigured = isRevenueCatEnabled();

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
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Section */}
          <View className="items-center mt-8 mb-10">
            <View className="w-24 h-24 bg-green-500/20 rounded-3xl items-center justify-center mb-6 overflow-hidden">
              <Image
                source={require("../../assets/image-1765481776.png")}
                className="w-20 h-20"
                resizeMode="contain"
              />
            </View>
            {isPremiumAtLimit ? (
              <>
                <Text className="text-white text-3xl font-bold text-center mb-3">
                  Usage Limit Reached
                </Text>
                <Text className="text-gray-400 text-base text-center leading-6">
                  {"You've used all your premium generations this season. Thank you for being a premium member!"}
                </Text>
              </>
            ) : (
              <>
                <Text className="text-white text-3xl font-bold text-center mb-3">
                  Unlock More Magic
                </Text>
                <Text className="text-gray-400 text-base text-center leading-6">
                  Create more elf sightings and make this Christmas truly magical
                </Text>
              </>
            )}
          </View>

          {/* Premium user usage stats */}
          {isPremium && (
            <View className="bg-green-500/10 rounded-2xl p-5 mb-6 border border-green-500/20">
              <View className="flex-row items-center mb-4">
                <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                <Text className="text-green-500 font-semibold text-base ml-2">
                  Premium Member
                </Text>
              </View>
              <View className="flex-row justify-between">
                <View className="flex-1">
                  <Text className="text-gray-400 text-sm">Photos Remaining</Text>
                  <Text className="text-white text-2xl font-bold">
                    {Math.max(0, premiumPhotosRemaining)}
                  </Text>
                  <Text className="text-gray-500 text-xs">of {USAGE_LIMITS.premium.photos}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-gray-400 text-sm">Videos Remaining</Text>
                  <Text className="text-white text-2xl font-bold">
                    {Math.max(0, premiumVideosRemaining)}
                  </Text>
                  <Text className="text-gray-500 text-xs">of {USAGE_LIMITS.premium.videos}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Features List - only show for non-premium users */}
          {!isPremium && (
            <View className="bg-white/5 rounded-2xl p-6 mb-8">
              <FeatureItem
                icon="images"
                title={`${USAGE_LIMITS.premium.photos} Photo Sightings`}
                description={`Free users get ${USAGE_LIMITS.free.photos} photos`}
              />
              <FeatureItem
                icon="videocam"
                title={`${USAGE_LIMITS.premium.videos} Video Sightings`}
                description={`Free users get ${USAGE_LIMITS.free.videos} video`}
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
          )}

          {/* Pricing - only show for non-premium users */}
          {!isPremium && (
            <View className="items-center mb-8">
              <Text className="text-gray-500 text-sm mb-2">
                Limited Time Holiday Offer
              </Text>
              {isLoading ? (
                <ActivityIndicator color="#22c55e" size="small" />
              ) : (
                <>
                  <View className="flex-row items-baseline">
                    <Text className="text-white text-4xl font-bold">{price}</Text>
                    <Text className="text-gray-400 text-base ml-2">/ lifetime</Text>
                  </View>
                  <Text className="text-green-500 text-sm mt-2">
                    One-time purchase, no subscription
                  </Text>
                </>
              )}
            </View>
          )}

          {/* Error Message */}
          {error && (
            <View className="bg-red-500/10 rounded-xl p-4 mb-4">
              <Text className="text-red-400 text-sm text-center">{error}</Text>
            </View>
          )}

          {/* Subscribe Button - only for non-premium users */}
          {!isPremium && (
            <Pressable
              onPress={handleSubscribe}
              disabled={isPurchasing || isLoading || !lifetimePackage}
              className={`rounded-2xl py-4 mb-4 ${
                isPurchasing || isLoading || !lifetimePackage
                  ? "bg-green-600/50"
                  : "bg-green-600 active:opacity-80"
              }`}
            >
              {isPurchasing ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-lg font-bold text-center">
                  Unlock Premium
                </Text>
              )}
            </Pressable>
          )}

          {/* Go Back Button - for premium users */}
          {isPremium && (
            <Pressable
              onPress={() => navigation.goBack()}
              className="rounded-2xl py-4 mb-4 bg-gray-700 active:opacity-80"
            >
              <Text className="text-white text-lg font-bold text-center">
                Go Back
              </Text>
            </Pressable>
          )}

          {/* Restore Button - only for non-premium users */}
          {!isPremium && (
            <Pressable
              onPress={handleRestore}
              disabled={isRestoring || !isConfigured}
              className="py-3 mb-6"
            >
              {isRestoring ? (
                <ActivityIndicator color="#9ca3af" size="small" />
              ) : (
                <Text className="text-gray-400 text-base text-center">
                  Restore Purchase
                </Text>
              )}
            </Pressable>
          )}

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
