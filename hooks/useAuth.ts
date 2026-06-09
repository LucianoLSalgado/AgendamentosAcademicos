// hooks/useAuth.ts
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { login as loginService, logout as logoutService } from '@/services/authService';
import { CredenciaisLogin } from '@/types';

export function useAuth() {
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const setAuth = useAuthStore(s => s.setAuth);
  const clearAuth = useAuthStore(s => s.clearAuth);

  async function login(credenciais: CredenciaisLogin) {
    try {
      setCarregando(true);
      setErro(null);
      const { usuario, token } = await loginService(credenciais);  // ← desestrutura o par
      setAuth(usuario, token);  // ← token real (ou token-local offline)
      return true;
    } catch (e: any) {
      setErro(e.message);
      return false;
    } finally {
      setCarregando(false);
    }
  }

  async function logout() {
    await logoutService();
    clearAuth();
  }

  return { login, logout, carregando, erro };
}

