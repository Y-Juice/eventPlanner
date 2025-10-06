import { Tabs } from "expo-router";
import { Image } from "react-native";

const icons = {
  home: require("../assets/home.png"),
  bookmarked: require("../assets/saved.png"),
  planEvent: require("../assets/plusIcon.png"),
  calender: require("../assets/calendar.png"),
  profile: require("../assets/profile.png"),
};

function TabBarIcon({ source, focused }: { source: any; focused: boolean }) {
  return (
    <Image
      source={source}
      style={{
        width: 28,
        height: 28,
        }}
      resizeMode="contain"
    />
  );
}

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#007AFF",
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
    </Tabs>
  );
}