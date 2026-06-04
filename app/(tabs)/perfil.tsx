// app/(tabs)/perfil.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/store/authStore';
import { useAuth } from '@/hooks/useAuth';
import { useAgendamentos } from '@/hooks/useAgendamentos';
import { OfflineBanner } from '@/components/OfflineBanner';

export default function PerfilScreen() {
  const usuario = useAuthStore(s => s.usuario);
  const { logout } = useAuth();
  const { agendamentos } = useAgendamentos();

  const stats = {
    total: agendamentos.length,
    pendentes: agendamentos.filter(a => a.status === 'pendente').length,
    confirmados: agendamentos.filter(a => a.status === 'confirmado').length,
    cancelados: agendamentos.filter(a => a.status === 'cancelado').length,
  };

  function confirmarLogout() {
    Alert.alert('Sair', 'Deseja encerrar sua sessão?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: logout },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <OfflineBanner />
      <View style={styles.container}>
        <View style={styles.avatar}>
          <Text style={styles.avatarTxt}>{usuario?.nome?.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.nome}>{usuario?.nome}</Text>
        <Text style={styles.email}>{usuario?.email}</Text>
        <View style={styles.tipoBadge}>
          <Text style={styles.tipoTxt}>{usuario?.tipo === 'professor' ? '👨‍🏫 Professor' : '🎓 Aluno'}</Text>
        </View>

        {/* Estatísticas */}
        <View style={styles.stats}>
          {Object.entries(stats).map(([key, val]) => (
            <View key={key} style={styles.statItem}>
              <Text style={styles.statNum}>{val}</Text>
              <Text style={styles.statLabel}>{key.charAt(0).toUpperCase() + key.slice(1)}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.btnLogout} onPress={confirmarLogout}>
          <Text style={styles.btnTxt}>Sair da conta</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F3F4F6' },
  container: { flex: 1, alignItems: 'center', padding: 24 },
  avatar: {
    width: 96, height: 96, borderRadius: 48, backgroundColor: '#2E5FA3',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12
  },
  avatarTxt: { fontSize: 40, color: '#FFF', fontWeight: '800' },
  nome: { fontSize: 22, fontWeight: '800', color: '#1F3864' },
  email: { fontSize: 15, color: '#6B7280', marginTop: 4, marginBottom: 8 },
  tipoBadge: {
    backgroundColor: '#EFF6FF', paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20, marginBottom: 24
  },
  tipoTxt: { color: '#2E5FA3', fontWeight: '600', fontSize: 14 },
  stats: {
    flexDirection: 'row', gap: 12, marginBottom: 32, flexWrap: 'wrap',
    justifyContent: 'center'
  },
  statItem: {
    backgroundColor: '#FFF', borderRadius: 12, padding: 16,
    alignItems: 'center', minWidth: 80, elevation: 2
  },
  statNum: { fontSize: 24, fontWeight: '800', color: '#2E5FA3' },
  statLabel: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  btnLogout: {
    backgroundColor: '#FEE2E2', paddingHorizontal: 32, paddingVertical: 14,
    borderRadius: 12, width: '100%', alignItems: 'center'
  },
  btnTxt: { color: '#EF4444', fontSize: 16, fontWeight: '700' },
});
