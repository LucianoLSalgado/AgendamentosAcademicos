// store/authStore.ts
import { create } from 'zustand';
import { AuthState } from '@/types';

// create() recebe uma função que retorna o estado inicial + as actions
export const useAuthStore = create<AuthState>((set) => ({
  // Estado inicial: nenhum usuário logado
  usuario: null,
  token: null,

  // Action: chamada após login bem-sucedido
  setAuth: (usuario, token) => set({ usuario, token }),

  // Action: chamada após logout
  clearAuth: () => set({ usuario: null, token: null }),
}));

// Uso em qualquer componente:
// const usuario = useAuthStore(s => s.usuario);  // lê apenas 'usuario'
// const setAuth = useAuthStore(s => s.setAuth);  // pega a action
// O seletor (s => s.usuario) garante que o componente só re-renderiza
// quando 'usuario' muda — não quando 'token' muda.
