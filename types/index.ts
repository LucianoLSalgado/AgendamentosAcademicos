// types/index.ts

// ── Usuário ──────────────────────────────────────────────────────
export interface Usuario {
  id: number;
  nome: string;
  email: string;
  tipo: 'aluno' | 'professor';  // union type: só esses dois valores
  criadoEm: string;             // ISO 8601: '2026-06-07T10:00:00Z'
}

// ── Agendamento ──────────────────────────────────────────────────
// Tipo de um agendamento já salvo no banco
export interface Agendamento {
  id: number;
  titulo: string;
  descricao: string;
  dataHora: string;             // ISO 8601
  tipo: TipoAgendamento;
  status: StatusAgendamento;
  usuarioId: number;
  criadoEm: string;
}

// Tipo para criar um novo agendamento (sem id e criadoEm, gerados pelo banco)
export type NovoAgendamento = Omit<Agendamento, 'id' | 'criadoEm' | 'status'>;

// Tipo para atualizar (todos os campos opcionais exceto id)
export type AtualizacaoAgendamento = Partial<Omit<Agendamento, 'id' | 'criadoEm'>> & { id: number };

// ── Enumerações de domínio ────────────────────────────────────────
export type StatusAgendamento = 'pendente' | 'confirmado' | 'cancelado';

export type TipoAgendamento =
  | 'orientacao'
  | 'laboratorio'
  | 'atendimento'
  | 'reuniao';

// ── Autenticação ─────────────────────────────────────────────────
export interface CredenciaisLogin {
  email: string;
  senha: string;
}

export interface RespostaLogin {
  usuario: Usuario;
  accessToken: string;
  refreshToken: string;
}

// ── Estado da Store (Zustand) ─────────────────────────────────────
export interface AuthState {
  usuario: Usuario | null;
  token: string | null;
  setAuth: (usuario: Usuario, token: string) => void;
  clearAuth: () => void;
}
