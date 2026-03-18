import AsyncStorage from "@react-native-async-storage/async-storage";

const EXPENSES_STORAGE_KEY = "@meugasto:expenses";

export interface ExpenseItem {
  id: string;
  title: string;
  amount: number;
  category: string;
  notes: string;
  date: string;
  createdAt: string;
}

export async function getExpenses() {
  const storedExpenses = await AsyncStorage.getItem(EXPENSES_STORAGE_KEY);

  if (!storedExpenses) {
    return [];
  }

  return JSON.parse(storedExpenses) as ExpenseItem[];
}

export async function saveExpense(expense: ExpenseItem) {
  const currentExpenses = await getExpenses();
  const updatedExpenses = [expense, ...currentExpenses];

  await AsyncStorage.setItem(
    EXPENSES_STORAGE_KEY,
    JSON.stringify(updatedExpenses)
  );
}

export async function deleteExpense(expenseId: string) {
  const currentExpenses = await getExpenses();

  const updatedExpenses = currentExpenses.filter(
    (expense) => expense.id !== expenseId
  );

  await AsyncStorage.setItem(
    EXPENSES_STORAGE_KEY,
    JSON.stringify(updatedExpenses)
  );
}