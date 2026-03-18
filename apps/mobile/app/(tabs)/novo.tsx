import { View, Text } from "react-native";

export default function NovoGastoScreen() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#f3f4f6",
        padding: 24,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text style={{ fontSize: 28, fontWeight: "700", color: "#111827" }}>
        Novo Gasto
      </Text>
      <Text style={{ fontSize: 16, color: "#6b7280", marginTop: 8 }}>
        Aqui ficará o formulário
      </Text>
    </View>
  );
}