// app/+not-found.tsx
import { Link, Stack } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

// Expo Router exige este arquivo — exibido para qualquer rota inválida
export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Página não encontrada' }} />
      <View style={styles.container}>
        <Text style={styles.txt}>404 — Tela não encontrada</Text>
        <Link href='/(tabs)'>
          <Text style={styles.link}>Voltar para o início</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  txt:       { fontSize: 18, color: '#374151', marginBottom: 16 },
  link:      { color: '#2E5FA3', fontSize: 16, textDecorationLine: 'underline' },
});
