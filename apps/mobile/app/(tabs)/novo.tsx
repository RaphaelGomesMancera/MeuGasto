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
      createdAt: new Date().toISOString(),
    };

    try {
      await saveExpense(newExpense);

      Alert.alert("Sucesso", "Gasto salvo com sucesso.");

      setTitle("");
      setAmount("");
      setCategory("Alimentação");
      setNotes("");
    } catch {
      Alert.alert("Erro", "Não foi possível salvar o gasto.");
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Novo Gasto</Text>
      <Text style={styles.subtitle}>Preencha os dados do gasto</Text>

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
          placeholder="Ex: 150.00"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
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

      <Pressable style={styles.saveButton} onPress={handleSaveExpense}>
        <Text style={styles.saveButtonText}>Salvar gasto</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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