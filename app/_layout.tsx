import { useFonts } from 'expo-font';
import { Tabs, useRouter, useSegments } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from "react";
import { Image, View } from "react-native";
import 'react-native-url-polyfill/auto';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const icons = {
  home: require("../assets/home.png"),
  bookmarked: require("../assets/saved.png"),
  planEvent: require("../assets/plusIcon.png"),
  calender: require("../assets/calendar.png"),
  profile: require("../assets/profile.png"),
};

function TabBarIcon({ source, focused }: { source: any; focused: boolean }) {
  return (
    <View
      style={{
        backgroundColor: focused ? "#fff" : "transparent",
        borderRadius: 20,
        padding: 8,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Image
        source={source}
        style={{
          width: 22,
          height: 22,
          tintColor: focused ? "#000" : "#fff",
        }}
        resizeMode="contain"
      />
    </View>
  );
}

function ProtectedLayout() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'login' || segments[0] === 'register';

    // Only redirect authenticated users away from auth screens
    if (user && inAuthGroup) {
      router.replace('/');
    }
  }, [user, loading, segments, router]);

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: "#000",
            borderTopWidth: 0,
            elevation: 0,
            height: 70,
          },
          tabBarShowLabel: false, // Hide text under icons
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabBarIcon source={icons.home} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="bookmarked"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabBarIcon source={icons.bookmarked} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="planEvent"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabBarIcon source={icons.planEvent} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="calender"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabBarIcon source={icons.calender} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            tabBarIcon: ({ focused }) => (
              <TabBarIcon source={icons.profile} focused={focused} />
            ),
          }}
        />
        {/* This hides the event detail page from the tab bar */}
        <Tabs.Screen
          name="event/[id]"
          options={{
            href: null,
          }}
        />
        {/* Hide auth screens from tab bar */}
        <Tabs.Screen
          name="login"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="register"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="components/EventMap"
          options={{
            href: null,
          }}
        />
      </Tabs>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          paddingTop: 8,
        }}
      >
        {/* Bottom nav items */}
      </View>
    </>
  );
}

export default function Layout() {
  const [fontsLoaded, fontError] = useFonts({
    'AlanSans': require('../assets/fonts/alanSans.ttf'),
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AuthProvider>
      <ProtectedLayout />
    </AuthProvider>
  );
}