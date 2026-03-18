import React, { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { getExpenses, ExpenseItem } from "../../storage/expense-storage";

export default function GastosScreen() {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);

  useFocusEffect(
    useCallback(() => {
      async function loadExpenses() {
        const data = await getExpenses();
        setExpenses(data);
      }

      loadExpenses();
    }, [])
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Gastos</Text>
      <Text style={styles.subtitle}>Lista dos gastos cadastrados</Text>

      {expenses.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Nenhum gasto cadastrado ainda.</Text>
        </View>
      ) : (
        expenses.map((expense) => (
          <View key={expense.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{expense.title}</Text>
              <Text style={styles.cardAmount}>
                R$ {expense.amount.toFixed(2).replace(".", ",")}
              </Text>
            </View>

            <Text style={styles.cardCategory}>{expense.category}</Text>

            {expense.notes ? (
              <Text style={styles.cardNotes}>{expense.notes}</Text>
            ) : null}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  content: {
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginTop: 12,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 8,
  },
  emptyState: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  emptyStateText: {
    fontSize: 15,
    color: "#6b7280",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    gap: 8,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  cardAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  cardCategory: {
    fontSize: 14,
    color: "#6b7280",
  },
  cardNotes: {
    fontSize: 14,
    color: "#374151",
  },
});