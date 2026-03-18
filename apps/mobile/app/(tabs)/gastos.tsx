import React, { useCallback, useMemo, useState } from "react";
import { useFocusEffect } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  deleteExpense,
  ExpenseItem,
  getExpenses,
} from "../../storage/expense-storage";
import { extractMonthYear, getAvailableMonthYears } from "../../utils/date";

export default function GastosScreen() {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [selectedMonthYear, setSelectedMonthYear] = useState("");

  const loadExpenses = useCallback(async () => {
    const data = await getExpenses();
    setExpenses(data);

    if (data.length > 0) {
      const availableMonths = getAvailableMonthYears(data.map((item) => item.date));

      if (availableMonths.length > 0) {
        setSelectedMonthYear((current) => current || availableMonths[0]);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadExpenses();
    }, [loadExpenses])
  );

  const availableMonths = useMemo(() => {
    return getAvailableMonthYears(expenses.map((expense) => expense.date));
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    if (!selectedMonthYear) return expenses;

    return expenses.filter(
      (expense) => extractMonthYear(expense.date) === selectedMonthYear
    );
  }, [expenses, selectedMonthYear]);

  async function handleDeleteExpense(expenseId: string) {
    const confirmed = window.confirm("Tem certeza que deseja excluir este gasto?");

    if (!confirmed) {
      return;
    }

    await deleteExpense(expenseId);
    await loadExpenses();
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Gastos</Text>
      <Text style={styles.subtitle}>Lista dos gastos cadastrados</Text>

      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Mês selecionado</Text>

        <View style={styles.monthButtonsContainer}>
          {availableMonths.length === 0 ? (
            <Text style={styles.emptyFilterText}>Nenhum mês disponível</Text>
          ) : (
            availableMonths.map((month) => {
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

      {filteredExpenses.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            Nenhum gasto cadastrado para este mês.
          </Text>
        </View>
      ) : (
        filteredExpenses.map((expense) => (
          <View key={expense.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{expense.title}</Text>
              <Text style={styles.cardAmount}>
                R$ {expense.amount.toFixed(2).replace(".", ",")}
              </Text>
            </View>

            <Text style={styles.cardCategory}>{expense.category}</Text>
            <Text style={styles.cardDate}>Data: {expense.date}</Text>

            {expense.notes ? (
              <Text style={styles.cardNotes}>{expense.notes}</Text>
            ) : null}

            <Pressable
              style={styles.deleteButton}
              onPress={() => handleDeleteExpense(expense.id)}
            >
              <Text style={styles.deleteButtonText}>Excluir</Text>
            </Pressable>
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
  cardDate: {
    fontSize: 14,
    color: "#6b7280",
  },
  cardNotes: {
    fontSize: 14,
    color: "#374151",
  },
  deleteButton: {
    marginTop: 8,
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#dc2626",
  },
  deleteButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
});