// services/authService.ts
//
//   • login() com fallback offline real:
//     se não há rede, busca o usuário no SQLite local e gera token local
//   • Usa buscarUsuarioLocalPorEmail() para login offline
//
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/constants';
import { CredenciaisLogin, RespostaLogin, Usuario } from '@/types';
import { salvarUsuarioLocal, buscarUsuarioLocalPorEmail } from './database';
import api from './api';

// ── LOGIN ─────────────────────────────────────────────────────────────────
export async function login(credenciais: CredenciaisLogin): Promise<Usuario> {
  try {
    // Tenta autenticação online primeiro
    const { data } = await api.post<RespostaLogin>('/auth/login', credenciais);

    await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, data.accessToken);
    await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, data.refreshToken);
    await salvarUsuarioLocal(data.usuario);
    await AsyncStorage.setItem(STORAGE_KEYS.USUARIO, JSON.stringify(data.usuario));

    return data.usuario;
  } catch (error: any) {
    // ── Modo offline: tenta sessão local ────────────────────────────────
    if (!error.response) {
      const usuarioLocal = await buscarUsuarioLocalPorEmail(credenciais.email);
      if (usuarioLocal) {
        // Gera token local para manter o fluxo do AuthGuard funcionando
        const tokenLocal = `token-local-${usuarioLocal.id}-${Date.now()}`;
        await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, tokenLocal);
        await AsyncStorage.setItem(STORAGE_KEYS.USUARIO, JSON.stringify(usuarioLocal));
        console.log(`[Auth] Login offline para: ${usuarioLocal.email}`);
        return {
          ...usuarioLocal,
          tipo: usuarioLocal.tipo as 'aluno' | 'professor',
          criadoEm: new Date().toISOString(),
        };
      }
      // Nunca fez login online antes — não há cache
      throw new Error(
        'Sem conexão e nenhuma sessão salva. Conecte-se à internet para o primeiro acesso.'
      );
    }

    // ── Erros de autenticação online ────────────────────────────────────
    if (error.response?.status === 401) {
      throw new Error('E-mail ou senha incorretos.');
    }
    throw new Error('Erro ao fazer login. Tente novamente.');
  }
}

// ── LOGOUT ───────────────────────────────────────────────────────────────
export async function logout(): Promise<void> {
  // Tenta invalidar refresh token no servidor (falha silenciosa se offline)
  try {
    const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
    if (refreshToken) {
      await api.post('/auth/logout', { refreshToken });
    }
  } catch {
    // Logout offline: apenas limpa local
  }

  await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
  await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
  await AsyncStorage.removeItem(STORAGE_KEYS.USUARIO);
}

// ── RECUPERAR TOKEN ───────────────────────────────────────────────────────
export async function recuperarToken(): Promise<string | null> {
  return SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
}