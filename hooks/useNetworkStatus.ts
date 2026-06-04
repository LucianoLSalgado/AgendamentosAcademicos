// hooks/useNetworkStatus.ts
import { useState, useEffect } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
}

// Retorna o status de rede em tempo real.
// isConnected     = há interface de rede ativa (Wi-Fi / dados)
// isInternetReachable = consegue alcançar a internet de fato (evita redes cativas)
export function useNetworkStatus(): NetworkStatus {
  const [status, setStatus] = useState<NetworkStatus>({
    isConnected: true,          // otimista no SSR / boot
    isInternetReachable: true,
  });

  useEffect(() => {
    // Leitura inicial imediata
    NetInfo.fetch().then((state: NetInfoState) => {
      setStatus({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
      });
    });

    // Subscrição a mudanças contínuas
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setStatus({
        isConnected: state.isConnected ?? false,
        isInternetReachable: state.isInternetReachable,
      });
    });

    return unsubscribe; // limpa o listener ao desmontar
  }, []);

  return status;
}