import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

import HomeScreen from "../screens/HomeScreen";
import CreateSightingScreen from "../screens/CreateSightingScreen";
import GalleryScreen from "../screens/GalleryScreen";
import ViewSightingScreen from "../screens/ViewSightingScreen";
import GeneratingScreen from "../screens/GeneratingScreen";
import PaywallScreen from "../screens/PaywallScreen";
import SettingsScreen from "../screens/SettingsScreen";

export type RootStackParamList = {
  MainTabs: undefined;
  CreateSighting: { mode: "photo" | "video" };
  ViewSighting: { sightingId: string };
  Generating: { sceneUri: string; mode: "image" | "video"; sceneDescription?: string };
  Paywall: undefined;
};

export type TabParamList = {
  Home: undefined;
  Gallery: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#0a0f1a",
          borderTopColor: "#1a2535",
          borderTopWidth: 1,
          height: 85,
          paddingTop: 8,
        },
        tabBarActiveTintColor: "#22c55e",
        tabBarInactiveTintColor: "#64748b",
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
          tabBarLabel: "Home",
        }}
      />
      <Tab.Screen
        name="Gallery"
        component={GalleryScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="images" size={size} color={color} />
          ),
          tabBarLabel: "Sightings",
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
          tabBarLabel: "Settings",
        }}
      />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#0a0f1a" },
      }}
    >
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen
        name="CreateSighting"
        component={CreateSightingScreen}
        options={{
          presentation: "fullScreenModal",
          animation: "slide_from_bottom",
        }}
      />
      <Stack.Screen
        name="ViewSighting"
        component={ViewSightingScreen}
        options={{
          presentation: "card",
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="Generating"
        component={GeneratingScreen}
        options={{
          presentation: "fullScreenModal",
          animation: "fade",
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="Paywall"
        component={PaywallScreen}
        options={{
          presentation: "fullScreenModal",
          animation: "slide_from_bottom",
        }}
      />
    </Stack.Navigator>
  );
}
