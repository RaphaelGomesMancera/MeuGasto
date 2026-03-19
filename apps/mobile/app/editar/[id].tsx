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
import { isValidDate } from "../../utils/date";

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

    if (!isValidDate(date.trim())) {
      Alert.alert("Data inválida", "Informe uma data válida no formato DD/MM/AAAA.");
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
        <View style={styles.loadingCard}>
          <Text style={styles.loadingEyebrow}>MeuGasto</Text>
          <Text style={styles.loadingTitle}>Carregando lançamento</Text>
          <Text style={styles.loadingText}>
            Aguarde enquanto buscamos os dados do gasto.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.heroEyebrow}>Edição de lançamento</Text>
        <Text style={styles.heroTitle}>Atualize as informações do gasto</Text>
        <Text style={styles.heroSubtitle}>
          Revise os dados e salve as alterações para manter seu controle financeiro organizado.
        </Text>
      </View>

      <View style={styles.formCard}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Título</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Mercado do mês"
            placeholderTextColor="#94a3b8"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.formGroup, styles.halfWidth]}>
            <Text style={styles.label}>Valor</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: 150,00"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
          </View>

          <View style={[styles.formGroup, styles.halfWidth]}>
            <Text style={styles.label}>Data</Text>
            <TextInput
              style={styles.input}
              placeholder="18/03/2026"
              placeholderTextColor="#94a3b8"
              value={date}
              onChangeText={setDate}
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Categoria</Text>
          <View style={styles.categoriesContainer}>
            {categories.map((item) => {
              const isSelected = category === item;

              return (
                <Pressable
                  key={item}
                  style={[
                    styles.categoryButton,
                    isSelected && styles.categoryButtonSelected,
                  ]}
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
            placeholderTextColor="#94a3b8"
            multiline
            numberOfLines={4}
            value={notes}
            onChangeText={setNotes}
          />
        </View>

        <View style={styles.actionsColumn}>
          <Pressable style={styles.saveButton} onPress={handleUpdateExpense}>
            <Text style={styles.saveButtonText}>Salvar alterações</Text>
          </Pressable>

          <Pressable style={styles.cancelButton} onPress={() => router.back()}>
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#eef2f7",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingCard: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    gap: 8,
  },
  loadingEyebrow: {
    color: "#2563eb",
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  loadingTitle: {
    color: "#0f172a",
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },
  loadingText: {
    color: "#64748b",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
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
    gap: 6,
    shadowColor: "#0f172a",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  heroEyebrow: {
    color: "#93c5fd",
    fontSize: 13,
    fontWeight: "800",
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
    marginTop: 4,
  },
  formCard: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
    gap: 18,
  },
  formGroup: {
    gap: 10,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: "800",
    color: "#475569",
  },
  input: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#dbe3ee",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    fontSize: 15,
    color: "#0f172a",
  },
  textArea: {
    minHeight: 110,
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
    borderColor: "#dbe3ee",
  },
  categoryButtonSelected: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  categoryButtonText: {
    color: "#0f172a",
    fontSize: 14,
    fontWeight: "700",
  },
  categoryButtonTextSelected: {
    color: "#ffffff",
  },
  actionsColumn: {
    gap: 10,
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: "#2563eb",
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
    shadowColor: "#2563eb",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "800",
  },
  cancelButton: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#dbe3ee",
  },
  cancelButtonText: {
    color: "#475569",
    fontSize: 15,
    fontWeight: "800",
  },
});