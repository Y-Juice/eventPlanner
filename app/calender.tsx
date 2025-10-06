import { View, Text } from "react-native";

// Hide the header in Expo Router
export const options = {
  headerShown: false,
};

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {
        <View>
          <Text>Welcome to calender page!</Text>
        </View>
      }
    </View>
  );
}
