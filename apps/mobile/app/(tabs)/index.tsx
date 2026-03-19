import React, { useCallback, useMemo, useState } from "react";
import { useFocusEffect } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ExpenseItem, getExpenses } from "../../storage/expense-storage";
import { extractMonthYear, getAvailableMonthYears } from "../../utils/date";

const ALL_MONTHS_VALUE = "Todos";

export default function DashboardScreen() {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [selectedMonthYear, setSelectedMonthYear] = useState(ALL_MONTHS_VALUE);

  useFocusEffect(
    useCallback(() => {
      async function loadExpenses() {
        const data = await getExpenses();
        setExpenses(data);

        const availableMonths = getAvailableMonthYears(
          data.map((item) => item.date)
        );

        if (availableMonths.length === 0) {
          setSelectedMonthYear(ALL_MONTHS_VALUE);
          return;
        }

        setSelectedMonthYear((current) => {
          if (
            current === ALL_MONTHS_VALUE ||
            availableMonths.includes(current)
          ) {
            return current;
          }

          return availableMonths[0];
        });
      }

      loadExpenses();
    }, [])
  );

  const availableMonths = useMemo(() => {
    return getAvailableMonthYears(expenses.map((expense) => expense.date));
  }, [expenses]);

  const monthOptions = useMemo(() => {
    return [ALL_MONTHS_VALUE, ...availableMonths];
  }, [availableMonths]);

  const filteredExpenses = useMemo(() => {
    if (selectedMonthYear === ALL_MONTHS_VALUE) return expenses;

    return expenses.filter(
      (expense) => extractMonthYear(expense.date) === selectedMonthYear
    );
  }, [expenses, selectedMonthYear]);

  const totalSpent = useMemo(() => {
    return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [filteredExpenses]);

  const totalCount = filteredExpenses.length;
  const lastExpense = filteredExpenses[0] ?? null;

  const mostUsedCategory = useMemo(() => {
    if (filteredExpenses.length === 0) return "Nenhuma";

    const categoryMap: Record<string, number> = {};

    for (const expense of filteredExpenses) {
      categoryMap[expense.category] = (categoryMap[expense.category] || 0) + 1;
    }

    const sortedCategories = Object.entries(categoryMap).sort(
      (a, b) => b[1] - a[1]
    );

    return sortedCategories[0][0];
  }, [filteredExpenses]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.subtitle}>Resumo dos seus gastos</Text>

      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filtro</Text>

        <View style={styles.monthButtonsContainer}>
          {monthOptions.length === 1 && availableMonths.length === 0 ? (
            <Text style={styles.emptyFilterText}>Nenhum mês disponível</Text>
          ) : (
            monthOptions.map((month) => {
              const isSelected = selectedMonthYear === month;

              return (
                <Pressable
                  key={month}
                  style={[
                    styles.monthButton,
                    isSelected && styles.monthButtonSelected,
                  ]}
                  onPress={() => setSelectedMonthYear(month)}
                >
                  <Text
                    style={[
                      styles.monthButtonText,
                      isSelected && styles.monthButtonTextSelected,
                    ]}
                  >
                    {month}
                  </Text>
                </Pressable>
              );
            })
          )}
        </View>
      </View>

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
              <Text style={styles.cardSubValue}>Data: {lastExpense.date}</Text>
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
  filterContainer: {
    gap: 10,
  },
  filterLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  monthButtonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  monthButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  monthButtonSelected: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  monthButtonText: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "500",
  },
  monthButtonTextSelected: {
    color: "#ffffff",
  },
  emptyFilterText: {
    fontSize: 14,
    color: "#6b7280",
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