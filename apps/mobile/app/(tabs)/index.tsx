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

type CategorySummaryItem = {
  category: string;
  total: number;
  count: number;
};

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

  const categorySummary = useMemo<CategorySummaryItem[]>(() => {
    const summaryMap: Record<string, CategorySummaryItem> = {};

    for (const expense of filteredExpenses) {
      if (!summaryMap[expense.category]) {
        summaryMap[expense.category] = {
          category: expense.category,
          total: 0,
          count: 0,
        };
      }

      summaryMap[expense.category].total += expense.amount;
      summaryMap[expense.category].count += 1;
    }

    return Object.values(summaryMap).sort((a, b) => b.total - a.total);
  }, [filteredExpenses]);

  const highestCategoryTotal = useMemo(() => {
    if (categorySummary.length === 0) return 0;
    return categorySummary[0].total;
  }, [categorySummary]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <View style={styles.heroHeader}>
          <Text style={styles.heroEyebrow}>MeuGasto</Text>
          <Text style={styles.heroTitle}>Visão geral das suas despesas</Text>
          <Text style={styles.heroSubtitle}>
            Acompanhe seus gastos, categorias e tendências por período.
          </Text>
        </View>

        <View style={styles.heroTotalBlock}>
          <Text style={styles.heroTotalLabel}>
            {selectedMonthYear === ALL_MONTHS_VALUE
              ? "Total geral"
              : `Total de ${selectedMonthYear}`}
          </Text>
          <Text style={styles.heroTotalValue}>
            R$ {totalSpent.toFixed(2).replace(".", ",")}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Filtro por período</Text>

        <View style={styles.monthButtonsContainer}>
          {monthOptions.length === 1 && availableMonths.length === 0 ? (
            <Text style={styles.emptyText}>Nenhum mês disponível</Text>
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

      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Quantidade</Text>
          <Text style={styles.metricValue}>{totalCount}</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Categoria líder</Text>
          <Text style={styles.metricValueSmall}>{mostUsedCategory}</Text>
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoCardLabel}>Último lançamento</Text>

        {lastExpense ? (
          <>
            <Text style={styles.infoCardTitle}>{lastExpense.title}</Text>
            <Text style={styles.infoCardAmount}>
              R$ {lastExpense.amount.toFixed(2).replace(".", ",")}
            </Text>
            <Text style={styles.infoCardMeta}>{lastExpense.category}</Text>
            <Text style={styles.infoCardMeta}>Data: {lastExpense.date}</Text>
          </>
        ) : (
          <Text style={styles.emptyText}>Nenhum gasto cadastrado</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Resumo por categoria</Text>

        {categorySummary.length === 0 ? (
          <View style={styles.panelCard}>
            <Text style={styles.emptyText}>
              Nenhum gasto encontrado para este filtro.
            </Text>
          </View>
        ) : (
          categorySummary.map((item) => (
            <View key={item.category} style={styles.categoryCard}>
              <View style={styles.categoryHeader}>
                <View>
                  <Text style={styles.categoryName}>{item.category}</Text>
                  <Text style={styles.categoryMeta}>
                    {item.count} lançamento{item.count > 1 ? "s" : ""}
                  </Text>
                </View>

                <Text style={styles.categoryTotal}>
                  R$ {item.total.toFixed(2).replace(".", ",")}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Gráfico por categoria</Text>

        {categorySummary.length === 0 ? (
          <View style={styles.panelCard}>
            <Text style={styles.emptyText}>
              Nenhum dado para exibir no gráfico.
            </Text>
          </View>
        ) : (
          <View style={styles.panelCard}>
            {categorySummary.map((item) => {
              const widthPercentage =
                highestCategoryTotal > 0
                  ? (item.total / highestCategoryTotal) * 100
                  : 0;

              return (
                <View key={item.category} style={styles.chartItem}>
                  <View style={styles.chartItemHeader}>
                    <Text style={styles.chartLabel}>{item.category}</Text>
                    <Text style={styles.chartValue}>
                      R$ {item.total.toFixed(2).replace(".", ",")}
                    </Text>
                  </View>

                  <View style={styles.chartBarBackground}>
                    <View
                      style={[
                        styles.chartBarFill,
                        { width: `${Math.max(widthPercentage, 6)}%` },
                      ]}
                    />
                  </View>

                  <Text style={styles.chartMeta}>
                    {item.count} lançamento{item.count > 1 ? "s" : ""}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </View>
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
    backgroundColor: "#0f172a",
    borderRadius: 24,
    padding: 22,
    gap: 18,
    shadowColor: "#0f172a",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  heroHeader: {
    gap: 6,
  },
  heroEyebrow: {
    color: "#93c5fd",
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  heroTitle: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 34,
  },
  heroSubtitle: {
    color: "#cbd5e1",
    fontSize: 14,
    lineHeight: 20,
  },
  heroTotalBlock: {
    backgroundColor: "#1e293b",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#334155",
  },
  heroTotalLabel: {
    color: "#93c5fd",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6,
  },
  heroTotalValue: {
    color: "#ffffff",
    fontSize: 32,
    fontWeight: "800",
  },
  section: {
    gap: 12,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#475569",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0f172a",
  },
  monthButtonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  monthButton: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 999,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#dbe3ee",
  },
  monthButtonSelected: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  monthButtonText: {
    color: "#0f172a",
    fontSize: 14,
    fontWeight: "700",
  },
  monthButtonTextSelected: {
    color: "#ffffff",
  },
  metricsGrid: {
    flexDirection: "row",
    gap: 14,
  },
  metricCard: {
    flex: 1,
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
    gap: 10,
  },
  metricLabel: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "700",
  },
  metricValue: {
    color: "#0f172a",
    fontSize: 30,
    fontWeight: "800",
  },
  metricValueSmall: {
    color: "#0f172a",
    fontSize: 22,
    fontWeight: "800",
  },
  infoCard: {
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
    gap: 6,
  },
  infoCardLabel: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 4,
  },
  infoCardTitle: {
    color: "#0f172a",
    fontSize: 24,
    fontWeight: "800",
  },
  infoCardAmount: {
    color: "#2563eb",
    fontSize: 18,
    fontWeight: "800",
  },
  infoCardMeta: {
    color: "#64748b",
    fontSize: 14,
    fontWeight: "500",
  },
  categoryCard: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  categoryName: {
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "800",
  },
  categoryMeta: {
    color: "#64748b",
    fontSize: 13,
    marginTop: 4,
  },
  categoryTotal: {
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "800",
  },
  panelCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 16,
  },
  chartItem: {
    gap: 8,
  },
  chartItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  chartLabel: {
    flex: 1,
    color: "#0f172a",
    fontSize: 15,
    fontWeight: "800",
  },
  chartValue: {
    color: "#0f172a",
    fontSize: 14,
    fontWeight: "800",
  },
  chartBarBackground: {
    width: "100%",
    height: 12,
    backgroundColor: "#dbeafe",
    borderRadius: 999,
    overflow: "hidden",
  },
  chartBarFill: {
    height: "100%",
    backgroundColor: "#2563eb",
    borderRadius: 999,
  },
  chartMeta: {
    color: "#64748b",
    fontSize: 13,
  },
  emptyText: {
    color: "#64748b",
    fontSize: 14,
  },
});