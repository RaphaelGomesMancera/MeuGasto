import { View, Text } from "react-native";

export default function HomeScreen() {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f9fafb",
      }}
    >
      <Text style={{ fontSize: 24, fontWeight: "700", color: "#111827" }}>
        MeuGasto Mobile
      </Text>
    </View>
  );
}