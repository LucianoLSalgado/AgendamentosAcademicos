// app/_layout.tsx
import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '@/store/authStore';
import { initDatabase } from '@/services/database';
import { recuperarToken } from '@/services/authService';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function RootLayout() {
  const [inicializando, setInicializando] = useState(true);
  const token = useAuthStore(s => s.token);
  const setAuth = useAuthStore(s => s.setAuth);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    async function boot() {
      try {
        await initDatabase();

        const tokenSalvo = await recuperarToken();
        if (tokenSalvo) {
          const usuarioJson = await AsyncStorage.getItem('usuario_logado');
          if (usuarioJson) {
            const usuario = JSON.parse(usuarioJson);
            setAuth(usuario, tokenSalvo);
          }
        }
      } catch (e) {
        console.error('Erro no boot:', e);
      } finally {
        setInicializando(false);
      }
    }
    boot();
  }, []);

  useEffect(() => {
    if (inicializando) return;
    const naAreaAuth = segments[0] === '(auth)';
    if (!token && !naAreaAuth) {
      router.replace('/(auth)/login');
    } else if (token && naAreaAuth) {
      router.replace('/(tabs)');
    }
  }, [token, segments, inicializando]);

  if (inicializando) return <LoadingSpinner />;

  return (
    <SafeAreaProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </SafeAreaProvider>
  );
}