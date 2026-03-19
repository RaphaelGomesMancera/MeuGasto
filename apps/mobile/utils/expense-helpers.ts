import { ExpenseItem } from "../storage/expense-storage";
import { extractMonthYear, getAvailableMonthYears } from "./date";

export const ALL_MONTHS_VALUE = "Todos";
export const ALL_CATEGORIES_VALUE = "Todas";

export type CategorySummaryItem = {
  category: string;
  total: number;
  count: number;
};

type FilterExpensesParams = {
  expenses: ExpenseItem[];
  selectedMonthYear?: string;
  selectedCategory?: string;
  searchText?: string;
};

export function getAvailableExpenseMonths(expenses: ExpenseItem[]) {
  return getAvailableMonthYears(expenses.map((expense) => expense.date));
}

export function getAvailableExpenseCategories(expenses: ExpenseItem[]) {
  return Array.from(new Set(expenses.map((expense) => expense.category))).sort(
    (a, b) => a.localeCompare(b, "pt-BR")
  );
}

export function filterExpenses({
  expenses,
  selectedMonthYear = ALL_MONTHS_VALUE,
  selectedCategory = ALL_CATEGORIES_VALUE,
  searchText = "",
}: FilterExpensesParams) {
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
}

export function getTotalSpent(expenses: ExpenseItem[]) {
  return expenses.reduce((sum, expense) => sum + expense.amount, 0);
}

export function getMostUsedCategory(expenses: ExpenseItem[]) {
  if (expenses.length === 0) return "Nenhuma";

  const categoryMap: Record<string, number> = {};

  for (const expense of expenses) {
    categoryMap[expense.category] = (categoryMap[expense.category] || 0) + 1;
  }

  const sortedCategories = Object.entries(categoryMap).sort(
    (a, b) => b[1] - a[1]
  );

  return sortedCategories[0][0];
}

export function getCategorySummary(
  expenses: ExpenseItem[]
): CategorySummaryItem[] {
  const summaryMap: Record<string, CategorySummaryItem> = {};

  for (const expense of expenses) {
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
}