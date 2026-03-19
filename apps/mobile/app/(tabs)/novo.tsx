import React, { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { saveExpense } from "../../storage/expense-storage";
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

export default function NovoGastoScreen() {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Alimentação");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState("");

  async function handleSaveExpense() {
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

    const newExpense = {
      id: String(Date.now()),
      title: title.trim(),
      amount: numericAmount,
      category,
      notes: notes.trim(),
      date: date.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      await saveExpense(newExpense);

      Alert.alert("Sucesso", "Gasto salvo com sucesso.");

      setTitle("");
      setAmount("");
      setCategory("Alimentação");
      setNotes("");
      setDate("");
    } catch {
      Alert.alert("Erro", "Não foi possível salvar o gasto.");
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.heroEyebrow}>Novo lançamento</Text>
        <Text style={styles.heroTitle}>Cadastre um novo gasto</Text>
        <Text style={styles.heroSubtitle}>
          Preencha os dados abaixo para registrar uma despesa no seu controle financeiro.
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

        <Pressable style={styles.saveButton} onPress={handleSaveExpense}>
          <Text style={styles.saveButtonText}>Salvar gasto</Text>
        </Pressable>
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
  saveButton: {
    marginTop: 4,
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
});