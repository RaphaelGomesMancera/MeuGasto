import React, { useCallback, useMemo, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  deleteExpense,
  ExpenseItem,
  getExpenses,
} from "../../storage/expense-storage";
import { extractMonthYear, getAvailableMonthYears } from "../../utils/date";

const ALL_MONTHS_VALUE = "Todos";

export default function GastosScreen() {
  const router = useRouter();

  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [selectedMonthYear, setSelectedMonthYear] = useState(ALL_MONTHS_VALUE);
  const [searchText, setSearchText] = useState("");

  const loadExpenses = useCallback(async () => {
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
      if (current === ALL_MONTHS_VALUE || availableMonths.includes(current)) {
        return current;
      }

      return availableMonths[0];
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadExpenses();
    }, [loadExpenses])
  );

  const availableMonths = useMemo(() => {
    return getAvailableMonthYears(expenses.map((expense) => expense.date));
  }, [expenses]);

  const monthOptions = useMemo(() => {
    return [ALL_MONTHS_VALUE, ...availableMonths];
  }, [availableMonths]);

  const filteredExpenses = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();

    return expenses.filter((expense) => {
      const matchesMonth =
        selectedMonthYear === ALL_MONTHS_VALUE ||
        extractMonthYear(expense.date) === selectedMonthYear;

      const matchesSearch =
        normalizedSearch.length === 0 ||
        expense.title.toLowerCase().includes(normalizedSearch) ||
        expense.category.toLowerCase().includes(normalizedSearch);

      return matchesMonth && matchesSearch;
    });
  }, [expenses, selectedMonthYear, searchText]);

  async function confirmDeleteExpense(expenseId: string) {
    await deleteExpense(expenseId);
    await loadExpenses();
  }

  function handleDeleteExpense(expenseId: string) {
    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        "Tem certeza que deseja excluir este gasto?"
      );

      if (!confirmed) {
        return;
      }

      confirmDeleteExpense(expenseId);
      return;
    }

    Alert.alert(
      "Excluir gasto",
      "Tem certeza que deseja excluir este gasto?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => {
            confirmDeleteExpense(expenseId);
          },
        },
      ]
    );
  }

  function handleEditExpense(expenseId: string) {
    router.push({
      pathname: "/editar/[id]",
      params: { id: expenseId },
    });
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Gastos</Text>
      <Text style={styles.subtitle}>Lista dos gastos cadastrados</Text>

      <View style={styles.searchContainer}>
        <Text style={styles.filterLabel}>Buscar por título ou categoria</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Ex: mercado, transporte, lazer..."
          placeholderTextColor="#9ca3af"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filtro por mês</Text>

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

      {filteredExpenses.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>
            Nenhum gasto encontrado com os filtros atuais.
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

            <View style={styles.actionsContainer}>
              <Pressable
                style={styles.editButton}
                onPress={() => handleEditExpense(expense.id)}
              >
                <Text style={styles.editButtonText}>Editar</Text>
              </Pressable>

              <Pressable
                style={styles.deleteButton}
                onPress={() => handleDeleteExpense(expense.id)}
              >
                <Text style={styles.deleteButtonText}>Excluir</Text>
              </Pressable>
            </View>
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
  searchContainer: {
    gap: 10,
  },
  filterContainer: {
    gap: 10,
  },
  filterLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  searchInput: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
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
  actionsContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  editButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#2563eb",
  },
  editButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },
  deleteButton: {
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