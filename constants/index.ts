// constants/index.ts

// URL base da API — em produção, muda apenas aqui
// Para testes locais com Expo Go no celular físico, use o IP da sua máquina
// (não use 'localhost' — o celular não sabe quem é 'localhost' da sua máquina)
export const API_BASE_URL = 'http://192.168.0.10:3000'; // seu IP real aqui

export const STORAGE_KEYS = {
  ACCESS_TOKEN:  'jwt_access_token',
  REFRESH_TOKEN: 'jwt_refresh_token',
  USUARIO:       'usuario_logado',   // chave usada por authService e register
} as const;

export const LABELS_TIPO: Record<string, string> = {
  orientacao:  'Orientação',
  laboratorio: 'Laboratório',
  atendimento: 'Atendimento',
  reuniao:     'Reunião',
};

export const CORES_STATUS: Record<string, string> = {
  pendente:   '#F59E0B',
  confirmado: '#10B981',
  cancelado:  '#EF4444',
};