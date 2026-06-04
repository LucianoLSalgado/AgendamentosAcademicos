// components/StatusBadge.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusAgendamento } from '@/types';
import { corDoStatus, formatarStatus } from '@/utils/formatters';

interface Props {
  status: StatusAgendamento;
}

export const StatusBadge: React.FC<Props> = ({ status }) => {
  const cor = corDoStatus(status);
  return (
    <View style={[styles.badge, { backgroundColor: cor + '22' }]}>
      {/* cor + '22' = cor com 13% de opacidade (hex) → fundo suave */}
      <View style={[styles.dot, { backgroundColor: cor }]} />
      <Text style={[styles.texto, { color: cor }]}>
        {formatarStatus(status)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6, height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  texto: { fontSize: 12, fontWeight: '600' },
});
