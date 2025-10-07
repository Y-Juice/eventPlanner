import { Tabs } from "expo-router";
import { Image, View } from "react-native";
import 'react-native-url-polyfill/auto';

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
        borderRadius: 5,
        padding: focused ? 15 : 0,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Image
        source={source}
        style={{
          width: 22,
          height: 22,
          tintColor: focused ? "#007AFF" : undefined, // Set icon color when focused
        }}
        resizeMode="contain"
      />
    </View>
  );
}

export default function Layout() {
  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: "#007AFF",
            paddingTop: 10, // Add small top padding
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