import React, { useCallback, useMemo, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { ExpenseItem, getExpenses } from "../../storage/expense-storage";
import {
  ALL_MONTHS_VALUE,
  CategorySummaryItem,
  filterExpenses,
  getAvailableExpenseMonths,
  getCategorySummary,
  getMostUsedCategory,
  getTotalSpent,
} from "../../utils/expense-helpers";

function formatCurrency(value: number) {
  return `R$ ${value.toFixed(2).replace(".", ",")}`;
}

export default function DashboardScreen() {
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [selectedMonthYear, setSelectedMonthYear] = useState(ALL_MONTHS_VALUE);
  const { width } = useWindowDimensions();

  const isSmallScreen = width < 420;

  useFocusEffect(
    useCallback(() => {
      async function loadExpenses() {
        const data = await getExpenses();
        setExpenses(data);

        const availableMonths = getAvailableExpenseMonths(data);

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
    return getAvailableExpenseMonths(expenses);
  }, [expenses]);

  const monthOptions = useMemo(() => {
    return [ALL_MONTHS_VALUE, ...availableMonths];
  }, [availableMonths]);

  const filteredExpenses = useMemo(() => {
    return filterExpenses({
      expenses,
      selectedMonthYear,
    });
  }, [expenses, selectedMonthYear]);

  const totalSpent = useMemo(() => {
    return getTotalSpent(filteredExpenses);
  }, [filteredExpenses]);

  const totalCount = filteredExpenses.length;

  const mostUsedCategory = useMemo(() => {
    return getMostUsedCategory(filteredExpenses);
  }, [filteredExpenses]);

  const categorySummary = useMemo<CategorySummaryItem[]>(() => {
    return getCategorySummary(filteredExpenses);
  }, [filteredExpenses]);

  const highestCategoryTotal = useMemo(() => {
    if (categorySummary.length === 0) return 0;
    return categorySummary[0].total;
  }, [categorySummary]);

  const recentExpenses = useMemo(() => {
    return filteredExpenses.slice(0, 4);
  }, [filteredExpenses]);

  const averageSpent = useMemo(() => {
    if (filteredExpenses.length === 0) return 0;
    return totalSpent / filteredExpenses.length;
  }, [filteredExpenses, totalSpent]);

  const topCategory = categorySummary[0] ?? null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        isSmallScreen && styles.contentMobile,
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.heroCard, isSmallScreen && styles.heroCardMobile]}>
        <View
          style={[
            styles.heroTopRow,
            isSmallScreen && styles.heroTopRowMobile,
          ]}
        >
          <View style={styles.brandRow}>
            <Image
              source={require("../../assets/images/logo-meugasto.png")}
              style={[styles.logo, isSmallScreen && styles.logoMobile]}
              resizeMode="contain"
            />

            <View style={styles.brandTextBlock}>
              <Text
                style={[styles.brandName, isSmallScreen && styles.brandNameMobile]}
                numberOfLines={1}
              >
                MeuGasto
              </Text>
              <Text
                style={[styles.brandTag, isSmallScreen && styles.brandTagMobile]}
                numberOfLines={1}
              >
                controle financeiro pessoal
              </Text>
            </View>
          </View>

          <Pressable
            style={[styles.addButton, isSmallScreen && styles.addButtonMobile]}
            onPress={() => router.push("/novo")}
          >
            <Text style={styles.addButtonText}>+ Novo gasto</Text>
          </Pressable>
        </View>

        <View style={styles.heroHeader}>
          <Text style={[styles.heroEyebrow, isSmallScreen && styles.heroEyebrowMobile]}>
            Dashboard financeiro
          </Text>
          <Text style={[styles.heroTitle, isSmallScreen && styles.heroTitleMobile]}>
            Visão geral das suas despesas
          </Text>
          <Text
            style={[styles.heroSubtitle, isSmallScreen && styles.heroSubtitleMobile]}
          >
            Acompanhe seus gastos por período, veja as categorias que mais pesam
            no orçamento e monitore os lançamentos mais recentes.
          </Text>
        </View>

        <View
          style={[
            styles.heroTotalBlock,
            isSmallScreen && styles.heroTotalBlockMobile,
          ]}
        >
          <Text style={styles.heroTotalLabel}>
            {selectedMonthYear === ALL_MONTHS_VALUE
              ? "Total acumulado"
              : `Total de ${selectedMonthYear}`}
          </Text>
          <Text
            style={[
              styles.heroTotalValue,
              isSmallScreen && styles.heroTotalValueMobile,
            ]}
          >
            {formatCurrency(totalSpent)}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Filtrar por período</Text>

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

      <View style={styles.metricsStack}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Total gasto</Text>
          <Text
            style={[
              styles.metricValueMoney,
              isSmallScreen && styles.metricValueMoneyMobile,
            ]}
          >
            {formatCurrency(totalSpent)}
          </Text>
          <Text style={styles.metricHint}>
            {selectedMonthYear === ALL_MONTHS_VALUE
              ? "Soma de todos os lançamentos"
              : "Soma do período selecionado"}
          </Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Lançamentos</Text>
          <Text style={styles.metricValue}>{totalCount}</Text>
          <Text style={styles.metricHint}>
            {totalCount === 1
              ? "1 despesa registrada"
              : `${totalCount} despesas registradas`}
          </Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Categoria líder</Text>
          <Text style={styles.metricValueSmall} numberOfLines={1}>
            {mostUsedCategory}
          </Text>
          <Text style={styles.metricHint}>
            {topCategory
              ? `${formatCurrency(topCategory.total)} na categoria`
              : "Sem dados ainda"}
          </Text>
        </View>
      </View>

      <View style={styles.insightsStack}>
        <View style={styles.infoCard}>
          <Text style={styles.infoCardLabel}>Ticket médio</Text>
          <Text style={[styles.infoCardTitle, isSmallScreen && styles.infoCardTitleMobile]}>
            {formatCurrency(averageSpent)}
          </Text>
          <Text style={styles.infoCardMeta}>
            Valor médio por lançamento no filtro atual
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoCardLabel}>Maior categoria</Text>
          {topCategory ? (
            <>
              <Text
                style={[styles.infoCardTitle, isSmallScreen && styles.infoCardTitleMobile]}
                numberOfLines={1}
              >
                {topCategory.category}
              </Text>
              <Text style={styles.infoCardAmount}>
                {formatCurrency(topCategory.total)}
              </Text>
              <Text style={styles.infoCardMeta}>
                {topCategory.count} lançamento{topCategory.count > 1 ? "s" : ""}
              </Text>
            </>
          ) : (
            <Text style={styles.emptyText}>Nenhum gasto cadastrado</Text>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Últimos lançamentos</Text>

          <Pressable onPress={() => router.push("/gastos")}>
            <Text style={styles.sectionAction}>Ver todos</Text>
          </Pressable>
        </View>

        {recentExpenses.length === 0 ? (
          <View style={styles.panelCard}>
            <Text style={styles.emptyText}>
              Nenhum gasto encontrado para este filtro.
            </Text>
          </View>
        ) : (
          <View style={styles.panelCard}>
            {recentExpenses.map((expense, index) => (
              <View
                key={expense.id}
                style={[
                  styles.recentExpenseItem,
                  index !== recentExpenses.length - 1 && styles.recentExpenseBorder,
                ]}
              >
                <View style={styles.recentExpenseLeft}>
                  <Text style={styles.recentExpenseTitle} numberOfLines={1}>
                    {expense.title}
                  </Text>
                  <Text style={styles.recentExpenseMeta} numberOfLines={1}>
                    {expense.category} • {expense.date}
                  </Text>
                </View>

                <Text style={styles.recentExpenseAmount}>
                  {formatCurrency(expense.amount)}
                </Text>
              </View>
            ))}
          </View>
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
                <View style={styles.categoryLeft}>
                  <Text style={styles.categoryName} numberOfLines={1}>
                    {item.category}
                  </Text>
                  <Text style={styles.categoryMeta}>
                    {item.count} lançamento{item.count > 1 ? "s" : ""}
                  </Text>
                </View>

                <Text style={styles.categoryTotal}>
                  {formatCurrency(item.total)}
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Distribuição por categoria</Text>

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
                    <Text style={styles.chartLabel} numberOfLines={1}>
                      {item.category}
                    </Text>
                    <Text style={styles.chartValue}>
                      {formatCurrency(item.total)}
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
    paddingBottom: 36,
  },
  contentMobile: {
    padding: 14,
    gap: 14,
    paddingBottom: 26,
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
  heroCardMobile: {
    borderRadius: 22,
    padding: 16,
    gap: 14,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  heroTopRowMobile: {
    alignItems: "flex-start",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    minWidth: 0,
  },
  logo: {
    width: 92,
    height: 28,
  },
  logoMobile: {
    width: 74,
    height: 22,
  },
  brandTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  brandName: {
    color: "#93c5fd",
    fontSize: 16,
    fontWeight: "800",
  },
  brandNameMobile: {
    fontSize: 14,
  },
  brandTag: {
    color: "#64748b",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  brandTagMobile: {
    fontSize: 9,
    letterSpacing: 0.4,
  },
  addButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
  },
  addButtonMobile: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  addButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
  heroHeader: {
    gap: 8,
    alignItems: "flex-start",
  },
  heroEyebrow: {
    color: "#93c5fd",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.9,
  },
  heroEyebrowMobile: {
    fontSize: 11,
  },
  heroTitle: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 34,
  },
  heroTitleMobile: {
    fontSize: 21,
    lineHeight: 26,
  },
  heroSubtitle: {
    color: "#cbd5e1",
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 620,
  },
  heroSubtitleMobile: {
    fontSize: 13,
    lineHeight: 18,
  },
  heroTotalBlock: {
    backgroundColor: "#1e293b",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#334155",
  },
  heroTotalBlockMobile: {
    padding: 14,
    borderRadius: 16,
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
  heroTotalValueMobile: {
    fontSize: 24,
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
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  sectionAction: {
    color: "#2563eb",
    fontSize: 14,
    fontWeight: "800",
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
    borderColor: "#dbe3ee",
  },
  monthButtonSelected: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  monthButtonText: {
    color: "#0f172a",
    fontSize: 13,
    fontWeight: "700",
  },
  monthButtonTextSelected: {
    color: "#ffffff",
  },
  metricsStack: {
    gap: 12,
  },
  metricCard: {
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
    gap: 8,
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
  metricValueMoney: {
    color: "#0f172a",
    fontSize: 28,
    fontWeight: "800",
  },
  metricValueMoneyMobile: {
    fontSize: 22,
  },
  metricValueSmall: {
    color: "#0f172a",
    fontSize: 20,
    fontWeight: "800",
  },
  metricHint: {
    color: "#64748b",
    fontSize: 13,
    lineHeight: 18,
  },
  insightsStack: {
    gap: 12,
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
  infoCardTitleMobile: {
    fontSize: 20,
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
  panelCard: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 16,
  },
  recentExpenseItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    paddingBottom: 12,
  },
  recentExpenseBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  recentExpenseLeft: {
    flex: 1,
    gap: 4,
  },
  recentExpenseTitle: {
    color: "#0f172a",
    fontSize: 16,
    fontWeight: "800",
  },
  recentExpenseMeta: {
    color: "#64748b",
    fontSize: 13,
  },
  recentExpenseAmount: {
    color: "#0f172a",
    fontSize: 15,
    fontWeight: "800",
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
  categoryLeft: {
    flex: 1,
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
    fontSize: 15,
    fontWeight: "800",
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