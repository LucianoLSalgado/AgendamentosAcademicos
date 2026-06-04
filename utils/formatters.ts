// utils/formatters.ts
import { format, parseISO, isToday, isTomorrow, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { StatusAgendamento, TipoAgendamento } from '@/types';
import { LABELS_TIPO, CORES_STATUS } from '@/constants';

// Formata uma string ISO para exibição: '15 de junho às 14:00'
export function formatarDataHora(isoString: string): string {
  const data = parseISO(isoString);
  if (isToday(data)) {
    return `Hoje às ${format(data, 'HH:mm')}`;
  }
  if (isTomorrow(data)) {
    return `Amanhã às ${format(data, 'HH:mm')}`;
  }
  return format(data, "dd 'de' MMMM 'às' HH:mm", { locale: ptBR });
}

// Retorna 'Pendente', 'Confirmado', etc. com inicial maiúscula
export function formatarStatus(status: StatusAgendamento): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

// Retorna a cor hex de um status
export function corDoStatus(status: StatusAgendamento): string {
  return CORES_STATUS[status] ?? '#9CA3AF';
}

// Retorna o label legível de um tipo de agendamento
export function labelDoTipo(tipo: TipoAgendamento): string {
  return LABELS_TIPO[tipo] ?? tipo;
}

// Verifica se um agendamento já passou da data/hora
export function agendamentoExpirado(isoString: string): boolean {
  return isPast(parseISO(isoString));
}
