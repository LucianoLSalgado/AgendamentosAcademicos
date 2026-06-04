// app/(tabs)/agendamentos.tsx
import React, { useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAgendamentos } from '@/hooks/useAgendamentos';
import { AgendamentoCard } from '@/components/AgendamentoCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EmptyState } from '@/components/EmptyState';
import { ConfirmModal } from '@/components/ConfirmModal';
import { StatusAgendamento } from '@/types';
import { OfflineBanner } from '@/components/OfflineBanner';

const FILTROS: { label: string; valor: StatusAgendamento | 'todos' }[] = [
  { label: 'Todos', valor: 'todos' },
  { label: 'Pendentes', valor: 'pendente' },
  { label: 'Confirmados', valor: 'confirmado' },
  { label: 'Cancelados', valor: 'cancelado' },
];

export default function AgendamentosScreen() {
  const { agendamentos, carregando, cancelar, carregar } = useAgendamentos();
  const [filtro, setFiltro] = useState<StatusAgendamento | 'todos'>('todos');
  const [modalId, setModalId] = useState<number | null>(null);

  useFocusEffect(
    React.useCallback(() => {
      carregar();
    }, [carregar])
  );

  const lista = filtro === 'todos'
    ? agendamentos
    : agendamentos.filter(a => a.status === filtro);

  async function confirmarCancelamento() {
    if (modalId !== null) {
      await cancelar(modalId);
      setModalId(null);
    }
  }

  if (carregando) return <LoadingSpinner />;

  return (
    <SafeAreaView style={styles.safe}>
      <OfflineBanner />
      <View style={styles.header}>
        <Text style={styles.titulo}>Meus Agendamentos</Text>
      </View>

      {/* Filtros horizontais */}
      <View style={styles.filtros}>
        {FILTROS.map(f => (
          <TouchableOpacity
            key={f.valor}
            style={[styles.chip, filtro === f.valor && styles.chipAtivo]}
            onPress={() => setFiltro(f.valor)}
          >
            <Text style={[styles.chipTxt, filtro === f.valor && styles.chipTxtAtivo]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={lista}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.lista}
        ListEmptyComponent={
          <EmptyState mensagem='Nenhum agendamento encontrado'
            submensagem='Ajuste o filtro ou crie um novo agendamento' />
        }
        renderItem={({ item }) => (
          <AgendamentoCard
            agendamento={item}
            onPress={() => { }}
            onCancelar={item.status === 'pendente'
              ? () => setModalId(item.id)
              : undefined}
          />
        )}
      />

      <ConfirmModal
        visivel={modalId !== null}
        titulo='Cancelar Agendamento'
        mensagem='Deseja cancelar este agendamento? Esta ação pode ser revertida.'
        onConfirmar={confirmarCancelamento}
        onCancelar={() => setModalId(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F3F4F6' },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  titulo: { fontSize: 22, fontWeight: '800', color: '#1F3864' },
  filtros: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginBottom: 8 },
  chip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: '#E5E7EB'
  },
  chipAtivo: { backgroundColor: '#2E5FA3' },
  chipTxt: { color: '#374151', fontSize: 13, fontWeight: '600' },
  chipTxtAtivo: { color: '#FFF' },
  lista: { padding: 16, paddingTop: 8 },
});
