// app/(auth)/_layout.tsx
import { Stack } from 'expo-router';

// Layout do grupo de autenticação: Stack sem header visível
// Isso garante que login e register compartilhem o mesmo navegador
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
