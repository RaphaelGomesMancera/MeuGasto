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
const ALL_CATEGORIES_VALUE = "Todas";

export default function GastosScreen() {
  const router = useRouter();

  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [selectedMonthYear, setSelectedMonthYear] = useState(ALL_MONTHS_VALUE);
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORIES_VALUE);
  const [searchText, setSearchText] = useState("");

  const loadExpenses = useCallback(async () => {
    const data = await getExpenses();
    setExpenses(data);

    const availableMonths = getAvailableMonthYears(
      data.map((item) => item.date)
    );

    if (availableMonths.length === 0) {
      setSelectedMonthYear(ALL_MONTHS_VALUE);
    } else {
      setSelectedMonthYear((current) => {
        if (current === ALL_MONTHS_VALUE || availableMonths.includes(current)) {
          return current;
        }

        return availableMonths[0];
      });
    }

    const availableCategories = Array.from(
      new Set(data.map((item) => item.category))
    ).sort((a, b) => a.localeCompare(b, "pt-BR"));

    if (availableCategories.length === 0) {
      setSelectedCategory(ALL_CATEGORIES_VALUE);
    } else {
      setSelectedCategory((current) => {
        if (
          current === ALL_CATEGORIES_VALUE ||
          availableCategories.includes(current)
        ) {
          return current;
        }

        return ALL_CATEGORIES_VALUE;
      });
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

  const monthOptions = useMemo(() => {
    return [ALL_MONTHS_VALUE, ...availableMonths];
  }, [availableMonths]);

  const availableCategories = useMemo(() => {
    return Array.from(new Set(expenses.map((expense) => expense.category))).sort(
      (a, b) => a.localeCompare(b, "pt-BR")
    );
  }, [expenses]);

  const categoryOptions = useMemo(() => {
    return [ALL_CATEGORIES_VALUE, ...availableCategories];
  }, [availableCategories]);

  const filteredExpenses = useMemo(() => {
    const normalizedSearch = searchText.trim().toLowerCase();

    return expenses.filter((expense) => {
      const matchesMonth =
        selectedMonthYear === ALL_MONTHS_VALUE ||
        extractMonthYear(expense.date) === selectedMonthYear;

      const matchesCategory =
        selectedCategory === ALL_CATEGORIES_VALUE ||
        expense.category === selectedCategory;

      const matchesSearch =
        normalizedSearch.length === 0 ||
        expense.title.toLowerCase().includes(normalizedSearch) ||
        expense.category.toLowerCase().includes(normalizedSearch);

      return matchesMonth && matchesCategory && matchesSearch;
    });
  }, [expenses, selectedMonthYear, selectedCategory, searchText]);

  const filteredTotal = useMemo(() => {
    return filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [filteredExpenses]);

  async function confirmDeleteExpense(expenseId: string) {
    await deleteExpense(expenseId);
    await loadExpenses();
  }

  function handleDeleteExpense(expenseId: string) {
    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        "Tem certeza que deseja excluir este gasto?"
      );

      if (!confirmed) return;

      confirmDeleteExpense(expenseId);
      return;
    }

    Alert.alert(
      "Excluir gasto",
      "Tem certeza que deseja excluir este gasto?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => confirmDeleteExpense(expenseId),
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
      <View style={styles.heroCard}>
        <Text style={styles.heroEyebrow}>Gestão de despesas</Text>
        <Text style={styles.heroTitle}>Consulte e administre seus gastos</Text>
        <Text style={styles.heroSubtitle}>
          Busque, filtre e edite lançamentos com rapidez.
        </Text>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Itens filtrados</Text>
          <Text style={styles.summaryValue}>{filteredExpenses.length}</Text>
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total filtrado</Text>
          <Text style={styles.summaryValueMoney}>
            R$ {filteredTotal.toFixed(2).replace(".", ",")}
          </Text>
        </View>
      </View>

      <View style={styles.searchCard}>
        <Text style={styles.fieldLabel}>Buscar por título ou categoria</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Ex: mercado, transporte, lazer..."
          placeholderTextColor="#94a3b8"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <View style={styles.filterSection}>
        <Text style={styles.fieldLabel}>Filtro por mês</Text>

        <View style={styles.filterButtonsContainer}>
          {monthOptions.length === 1 && availableMonths.length === 0 ? (
            <Text style={styles.emptyText}>Nenhum mês disponível</Text>
          ) : (
            monthOptions.map((month) => {
              const isSelected = selectedMonthYear === month;

              return (
                <Pressable
                  key={month}
                  style={[
                    styles.filterButton,
                    isSelected && styles.filterButtonSelected,
                  ]}
                  onPress={() => setSelectedMonthYear(month)}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      isSelected && styles.filterButtonTextSelected,
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

      <View style={styles.filterSection}>
        <Text style={styles.fieldLabel}>Filtro por categoria</Text>

        <View style={styles.filterButtonsContainer}>
          {categoryOptions.length === 1 && availableCategories.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma categoria disponível</Text>
          ) : (
            categoryOptions.map((category) => {
              const isSelected = selectedCategory === category;

              return (
                <Pressable
                  key={category}
                  style={[
                    styles.filterButton,
                    isSelected && styles.filterButtonSelected,
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      isSelected && styles.filterButtonTextSelected,
                    ]}
                  >
                    {category}
                  </Text>
                </Pressable>
              );
            })
          )}
        </View>
      </View>

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsTitle}>Resultados</Text>
        <Text style={styles.resultsCount}>
          {filteredExpenses.length} item{filteredExpenses.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {filteredExpenses.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateTitle}>Nada encontrado</Text>
          <Text style={styles.emptyText}>
            Ajuste a busca ou os filtros para encontrar seus gastos.
          </Text>
        </View>
      ) : (
        filteredExpenses.map((expense) => (
          <View key={expense.id} style={styles.card}>
            <View style={styles.cardTopRow}>
              <View style={styles.cardTitleBlock}>
                <Text style={styles.cardTitle}>{expense.title}</Text>
                <Text style={styles.cardCategory}>{expense.category}</Text>
              </View>

              <View style={styles.amountBadge}>
                <Text style={styles.amountBadgeText}>
                  R$ {expense.amount.toFixed(2).replace(".", ",")}
                </Text>
              </View>
            </View>

            <Text style={styles.cardDate}>Data: {expense.date}</Text>

            {expense.notes ? (
              <Text style={styles.cardNotes}>{expense.notes}</Text>
            ) : null}

            <View style={styles.actionsContainer}>
              <Pressable
                style={[styles.actionButton, styles.editButton]}
                onPress={() => handleEditExpense(expense.id)}
              >
                <Text style={styles.editButtonText}>Editar</Text>
              </Pressable>

              <Pressable
                style={[styles.actionButton, styles.deleteButton]}
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
    backgroundColor: "#eef2f7",
  },
  content: {
    padding: 20,
    gap: 18,
    paddingBottom: 32,
  },
  heroCard: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    gap: 6,
  },
  heroEyebrow: {
    color: "#2563eb",
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  heroTitle: {
    color: "#0f172a",
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 34,
  },
  heroSubtitle: {
    color: "#64748b",
    fontSize: 14,
    lineHeight: 20,
  },
  summaryCard: {
    backgroundColor: "#0f172a",
    borderRadius: 20,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  summaryItem: {
    flex: 1,
    gap: 6,
  },
  summaryDivider: {
    width: 1,
    alignSelf: "stretch",
    backgroundColor: "#334155",
  },
  summaryLabel: {
    color: "#93c5fd",
    fontSize: 13,
    fontWeight: "700",
  },
  summaryValue: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "800",
  },
  summaryValueMoney: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "800",
  },
  searchCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 10,
  },
  filterSection: {
    gap: 12,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: "#475569",
  },
  searchInput: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#dbe3ee",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    color: "#0f172a",
  },
  filterButtonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 999,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dbe3ee",
  },
  filterButtonSelected: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  filterButtonText: {
    color: "#0f172a",
    fontSize: 14,
    fontWeight: "700",
  },
  filterButtonTextSelected: {
    color: "#ffffff",
  },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0f172a",
  },
  resultsCount: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748b",
  },
  emptyState: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 8,
  },
  emptyStateTitle: {
    color: "#0f172a",
    fontSize: 18,
    fontWeight: "800",
  },
  emptyText: {
    color: "#64748b",
    fontSize: 14,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    gap: 12,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  cardTitleBlock: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    color: "#0f172a",
    fontSize: 19,
    fontWeight: "800",
  },
  cardCategory: {
    color: "#2563eb",
    fontSize: 14,
    fontWeight: "700",
  },
  amountBadge: {
    backgroundColor: "#eff6ff",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  amountBadgeText: {
    color: "#1d4ed8",
    fontSize: 14,
    fontWeight: "800",
  },
  cardDate: {
    color: "#64748b",
    fontSize: 14,
    fontWeight: "500",
  },
  cardNotes: {
    color: "#334155",
    fontSize: 14,
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 2,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  editButton: {
    backgroundColor: "#2563eb",
  },
  editButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
  deleteButton: {
    backgroundColor: "#fee2e2",
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  deleteButtonText: {
    color: "#b91c1c",
    fontSize: 14,
    fontWeight: "800",
  },
});