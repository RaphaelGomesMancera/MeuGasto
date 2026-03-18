import { z } from "zod";

export const expenseSchema = z.object({
  title: z.string().min(2, "Título muito curto"),
  amount: z.number().positive("O valor deve ser maior que zero"),
  category: z.enum([
    "Alimentação",
    "Transporte",
    "Moradia",
    "Lazer",
    "Saúde",
    "Compras",
    "Assinaturas",
    "Outros",
  ]),
  date: z.string(),
  notes: z.string().optional(),
});