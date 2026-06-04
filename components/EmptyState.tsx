// components/EmptyState.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  mensagem: string;
  submensagem?: string;
}

export const EmptyState: React.FC<Props> = ({ mensagem, submensagem }) => (
  <View style={styles.container}>
    <Text style={styles.icone}>📭</Text>
    <Text style={styles.msg}>{mensagem}</Text>
    {submensagem && <Text style={styles.sub}>{submensagem}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  icone: { fontSize: 48, marginBottom: 16 },
  msg:   { fontSize: 18, fontWeight: '700', color: '#374151', textAlign: 'center' },
  sub:   { fontSize: 14, color: '#6B7280', textAlign: 'center', marginTop: 8 },
});
