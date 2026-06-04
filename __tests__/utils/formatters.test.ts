// __tests__/utils/formatters.test.ts
import { formatarDataHora, corDoStatus, agendamentoExpirado } from '@/utils/formatters';

describe('formatters', () => {

    describe('formatarDataHora', () => {
        it('deve retornar Hoje às HH:mm para datas de hoje', () => {
            const hoje = new Date();
            hoje.setHours(14, 30, 0, 0);
            const resultado = formatarDataHora(hoje.toISOString());
            expect(resultado).toBe('Hoje às 14:30');
        });

        it('deve formatar datas futuras com dia e mês em português', () => {
            const resultado = formatarDataHora('2026-12-25T10:00:00.000Z');
            // Aceita variações de fuso horário no teste
            expect(resultado).toMatch(/dezembro/i);
        });
    });

    describe('corDoStatus', () => {
        it('deve retornar amber para pendente', () => {
            expect(corDoStatus('pendente')).toBe('#F59E0B');
        });
        it('deve retornar verde para confirmado', () => {
            expect(corDoStatus('confirmado')).toBe('#10B981');
        });
        it('deve retornar vermelho para cancelado', () => {
            expect(corDoStatus('cancelado')).toBe('#EF4444');
        });
    });

    describe('agendamentoExpirado', () => {
        it('deve retornar true para datas no passado', () => {
            expect(agendamentoExpirado('2020-01-01T00:00:00Z')).toBe(true);
        });
        it('deve retornar false para datas no futuro', () => {
            expect(agendamentoExpirado('2099-01-01T00:00:00Z')).toBe(false);
        });
    });
});
