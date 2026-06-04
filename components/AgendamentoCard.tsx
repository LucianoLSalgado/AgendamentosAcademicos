// components/AgendamentoCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Agendamento } from '@/types';
import { StatusBadge } from './StatusBadge';
import { formatarDataHora, labelDoTipo } from '@/utils/formatters';

interface Props {
  agendamento: Agendamento;
  onPress: () => void;
  onCancelar?: () => void;
}

export const AgendamentoCard: React.FC<Props> = ({ agendamento, onPress, onCancelar }) => {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole='button'
      accessibilityLabel={`Agendamento ${agendamento.titulo}, ${formatarDataHora(agendamento.dataHora)}`}
    >
      <View style={styles.linha}>
        <Text style={styles.titulo} numberOfLines={1}>{agendamento.titulo}</Text>
        <StatusBadge status={agendamento.status} />
      </View>
      <Text style={styles.data}>{formatarDataHora(agendamento.dataHora)}</Text>
      <View style={styles.rodape}>
        <Text style={styles.tipo}>{labelDoTipo(agendamento.tipo)}</Text>
        {agendamento.status === 'pendente' && onCancelar && (
          <TouchableOpacity
            onPress={onCancelar}
            style={styles.btnCancelar}
            accessibilityRole='button'
            accessibilityLabel='Cancelar agendamento'
          >
            <Text style={styles.txtCancelar}>Cancelar</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,          // sombra no Android
  },
  linha: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  titulo: { fontSize: 16, fontWeight: '700', color: '#1F3864', flex: 1, marginRight: 8 },
  data:   { fontSize: 14, color: '#555', marginBottom: 8 },
  rodape: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tipo:   { fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 },
  btnCancelar: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 6, backgroundColor: '#FEE2E2' },
  txtCancelar: { color: '#EF4444', fontSize: 12, fontWeight: '600' },
});
