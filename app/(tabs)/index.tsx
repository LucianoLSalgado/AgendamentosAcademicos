// app/(tabs)/index.tsx
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { useAgendamentos } from '@/hooks/useAgendamentos';
import { AgendamentoCard } from '@/components/AgendamentoCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { formatarDataHora } from '@/utils/formatters';
import { OfflineBanner } from '@/components/OfflineBanner';

export default function HomeScreen() {
  const usuario = useAuthStore(s => s.usuario);
  const { agendamentos, carregando, cancelar } = useAgendamentos();

  // Próximos agendamentos: pendentes a partir de agora
  const proximos = agendamentos
    .filter(a => a.status === 'pendente')
    .slice(0, 3);  // mostra os 3 próximos no dashboard

  const total     = agendamentos.length;
  const pendentes = agendamentos.filter(a => a.status === 'pendente').length;
  const confirmados = agendamentos.filter(a => a.status === 'confirmado').length;

  if (carregando) return <LoadingSpinner />;

  return (
    <SafeAreaView style={styles.safe}>
      <OfflineBanner />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.ola}>Olá, {usuario?.nome?.split(' ')[0]} 👋</Text>
          <Text style={styles.data}>{new Date().toLocaleDateString('pt-BR', {
            weekday: 'long', day: 'numeric', month: 'long'
          })}</Text>
        </View>

        {/* Cards de resumo */}
        <View style={styles.resumo}>
          <View style={[styles.card, { backgroundColor: '#EFF6FF' }]}>
            <Text style={styles.cardNum}>{total}</Text>
            <Text style={styles.cardLabel}>Total</Text>
          </View>
          <View style={[styles.card, { backgroundColor: '#FFFBEB' }]}>
            <Text style={[styles.cardNum, { color: '#D97706' }]}>{pendentes}</Text>
            <Text style={styles.cardLabel}>Pendentes</Text>
          </View>
          <View style={[styles.card, { backgroundColor: '#F0FDF4' }]}>
            <Text style={[styles.cardNum, { color: '#059669' }]}>{confirmados}</Text>
            <Text style={styles.cardLabel}>Confirmados</Text>
          </View>
        </View>

        {/* Próximos agendamentos */}
        <Text style={styles.secTitulo}>Próximos Agendamentos</Text>
        {proximos.length === 0
          ? <EmptyState mensagem='Nenhum agendamento pendente'
              submensagem='Crie um novo agendamento na aba +' />
          : proximos.map(a => (
              <AgendamentoCard
                key={a.id}
                agendamento={a}
                onPress={() => {}}
                onCancelar={() => cancelar(a.id)}
              />
            ))
        }
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: '#F3F4F6' },
  scroll:     { flex: 1 },
  container:  { padding: 20 },
  header:     { marginBottom: 20 },
  ola:        { fontSize: 24, fontWeight: '800', color: '#1F3864' },
  data:       { fontSize: 14, color: '#6B7280', textTransform: 'capitalize', marginTop: 2 },
  resumo:     { flexDirection: 'row', gap: 10, marginBottom: 24 },
  card:       { flex: 1, borderRadius: 12, padding: 14, alignItems: 'center' },
  cardNum:    { fontSize: 28, fontWeight: '800', color: '#2E5FA3' },
  cardLabel:  { fontSize: 12, color: '#6B7280', marginTop: 2 },
  secTitulo:  { fontSize: 18, fontWeight: '700', color: '#1F3864', marginBottom: 12 },
});
