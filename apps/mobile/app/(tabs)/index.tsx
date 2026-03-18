import React, { useCallback, useMemo, useState } from "react";
import { useFocusEffect } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { ExpenseItem, getExpenses } from "../../storage/expense-storage";

export default function DashboardScreen() {
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

  const totalSpent = useMemo(() => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses]);

  const totalCount = expenses.length;

  const lastExpense = expenses[0] ?? null;

  const mostUsedCategory = useMemo(() => {
    if (expenses.length === 0) return "Nenhuma";

    const categoryMap: Record<string, number> = {};

    for (const expense of expenses) {
      categoryMap[expense.category] = (categoryMap[expense.category] || 0) + 1;
    }

    const sortedCategories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);

    return sortedCategories[0][0];
  }, [expenses]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.subtitle}>Resumo dos seus gastos</Text>

      <View style={styles.cardsContainer}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Total gasto</Text>
          <Text style={styles.cardValue}>
            R$ {totalSpent.toFixed(2).replace(".", ",")}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Quantidade</Text>
          <Text style={styles.cardValue}>{totalCount}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Categoria mais usada</Text>
          <Text style={styles.cardValueSmall}>{mostUsedCategory}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Último lançamento</Text>
          {lastExpense ? (
            <>
              <Text style={styles.cardValueSmall}>{lastExpense.title}</Text>
              <Text style={styles.cardSubValue}>
                R$ {lastExpense.amount.toFixed(2).replace(".", ",")}
              </Text>
            </>
          ) : (
            <Text style={styles.cardValueSmall}>Nenhum gasto</Text>
          )}
        </View>
      </View>
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
  cardsContainer: {
    gap: 14,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    gap: 8,
  },
  cardLabel: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "600",
  },
  cardValue: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
  },
  cardValueSmall: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  cardSubValue: {
    fontSize: 15,
    color: "#6b7280",
  },
});