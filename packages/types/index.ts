export type ExpenseCategory =
  | "Alimentação"
  | "Transporte"
  | "Moradia"
  | "Lazer"
  | "Saúde"
  | "Compras"
  | "Assinaturas"
  | "Outros";

export interface Expense {
  id: string;
  user_id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}