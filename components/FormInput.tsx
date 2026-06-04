// components/FormInput.tsx
import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';

interface Props extends TextInputProps {
  label: string;
  erro?: string;       // mensagem de validação
}

// Componente genérico de input com label e mensagem de erro
// Integra com react-hook-form via {...register('campo')} spread
export const FormInput: React.FC<Props> = ({ label, erro, ...rest }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, erro ? styles.inputErro : null]}
        placeholderTextColor='#9CA3AF'
        accessibilityLabel={label}
        {...rest}
      />
      {erro && <Text style={styles.textoErro}>{erro}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 16, color: '#111', backgroundColor: '#F9FAFB',
  },
  inputErro: { borderColor: '#EF4444' },
  textoErro: { color: '#EF4444', fontSize: 12, marginTop: 4 },
});
