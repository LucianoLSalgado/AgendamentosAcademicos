// hooks/useAgendamentos.ts
//
//   • Importa useNetworkStatus para saber se está online/offline
//   • Passa isConnected para todas as operações de escrita (híbrido real)
//   • Ao reconectar (isConnected muda false→true), processa a sync_queue
//
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { buscarAgendamentos, criarAgendamento, atualizarAgendamento, cancelarAgendamento, deletarAgendamento, } from '@/services/database';
import { processQueue } from '@/services/syncService';
import { useNetworkStatus } from './useNetworkStatus';
import { Agendamento, NovoAgendamento, AtualizacaoAgendamento } from '@/types';

export function useAgendamentos() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const usuario = useAuthStore(s => s.usuario);
  const { isConnected } = useNetworkStatus();
  const wasOffline = useRef(false); // rastreia transição offline→online

  const carregar = useCallback(async () => {
    if (!usuario) return;
    try {
      setCarregando(true);
      setErro(null);
      const dados = await buscarAgendamentos(usuario.id);
      setAgendamentos(dados);
    } catch (e: any) {
      setErro('Erro ao carregar agendamentos: ' + e.message);
    } finally {
      setCarregando(false);
    }
  }, [usuario]);

  useEffect(() => { carregar(); }, [carregar]);

  // Detecta reconexão (offline → online) e processa a fila
  useEffect(() => {
    if (!isConnected) {
      wasOffline.current = true;
      return;
    }
    if (wasOffline.current) {
      wasOffline.current = false;
      console.log('[useAgendamentos] Reconectado — sincronizando fila...');
      processQueue()
        .then(() => carregar()) // recarrega após sincronizar
        .catch(e => console.error('[useAgendamentos] Erro ao sincronizar:', e));
    }
  }, [isConnected, carregar]);

  async function criar(dados: NovoAgendamento): Promise<boolean> {
    try {
      setErro(null);
      await criarAgendamento(dados, isConnected);
      await carregar();
      return true;
    } catch (e: any) {
      setErro('Erro ao criar: ' + e.message);
      return false;
    }
  }

  async function atualizar(dados: AtualizacaoAgendamento): Promise<boolean> {
    try {
      setErro(null);
      await atualizarAgendamento(dados, isConnected);
      await carregar();
      return true;
    } catch (e: any) {
      setErro('Erro ao atualizar: ' + e.message);
      return false;
    }
  }

  async function cancelar(id: number): Promise<boolean> {
    try {
      setErro(null);
      await cancelarAgendamento(id, isConnected);
      await carregar();
      return true;
    } catch (e: any) {
      setErro('Erro ao cancelar: ' + e.message);
      return false;
    }
  }

  async function deletar(id: number): Promise<boolean> {
    try {
      setErro(null);
      await deletarAgendamento(id, isConnected);
      await carregar();
      return true;
    } catch (e: any) {
      setErro('Erro ao deletar: ' + e.message);
      return false;
    }
  }

  return {
    agendamentos, carregando, erro, isConnected, carregar, criar, atualizar, cancelar, deletar,
  };
}