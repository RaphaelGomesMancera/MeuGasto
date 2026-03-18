import React, { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  getExpenseById,
  updateExpense,
} from "../../storage/expense-storage";

const categories = [
  "Alimentação",
  "Transporte",
  "Moradia",
  "Lazer",
  "Saúde",
  "Compras",
  "Assinaturas",
  "Outros",
];

export default function EditarGastoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Alimentação");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadExpense() {
      if (!id) return;

      const expense = await getExpenseById(id);

      if (!expense) {
        Alert.alert("Erro", "Gasto não encontrado.");
        router.back();
        return;
      }

      setTitle(expense.title);
      setAmount(String(expense.amount).replace(".", ","));
      setCategory(expense.category);
      setNotes(expense.notes);
      setDate(expense.date);
      setCreatedAt(expense.createdAt);
      setLoading(false);
    }

    loadExpense();
  }, [id]);

  async function handleUpdateExpense() {
    const numericAmount = Number(amount.replace(",", "."));

    if (!title.trim()) {
      Alert.alert("Campo obrigatório", "Informe o título do gasto.");
      return;
    }

    if (!amount.trim()) {
      Alert.alert("Campo obrigatório", "Informe o valor do gasto.");
      return;
    }

    if (!date.trim()) {
      Alert.alert("Campo obrigatório", "Informe a data do gasto.");
      return;
    }

    if (Number.isNaN(numericAmount) || numericAmount <= 0) {
      Alert.alert("Valor inválido", "Informe um valor maior que zero.");
      return;
    }

    try {
      await updateExpense({
        id: String(id),
        title: title.trim(),
        amount: numericAmount,
        category,
        notes: notes.trim(),
        date: date.trim(),
        createdAt,
      });

      Alert.alert("Sucesso", "Gasto atualizado com sucesso.");
      router.back();
    } catch {
      Alert.alert("Erro", "Não foi possível atualizar o gasto.");
    }
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Carregando gasto...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Editar Gasto</Text>
      <Text style={styles.subtitle}>Atualize os dados do gasto</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Título</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Mercado do mês"
          value={title}
          onChangeText={setTitle}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Valor</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 150,00"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Data</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 18/03/2026"
          value={date}
          onChangeText={setDate}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Categoria</Text>
        <View style={styles.categoriesContainer}>
          {categories.map((item) => {
            const isSelected = category === item;

            return (
              <Pressable
                key={item}
                style={[styles.categoryButton, isSelected && styles.categoryButtonSelected]}
                onPress={() => setCategory(item)}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    isSelected && styles.categoryButtonTextSelected,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Observação</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Opcional"
          multiline
          numberOfLines={4}
          value={notes}
          onChangeText={setNotes}
        />
      </View>

      <Pressable style={styles.saveButton} onPress={handleUpdateExpense}>
        <Text style={styles.saveButtonText}>Salvar alterações</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#6b7280",
  },
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  content: {
    padding: 24,
    gap: 18,
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
  formGroup: {
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111827",
  },
  input: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  categoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  categoryButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  categoryButtonSelected: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  categoryButtonText: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "500",
  },
  categoryButtonTextSelected: {
    color: "#ffffff",
  },
  saveButton: {
    marginTop: 8,
    backgroundColor: "#111827",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
});