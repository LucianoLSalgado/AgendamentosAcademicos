// __tests__/components/AgendamentoCardTest.test.tsx
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { AgendamentoCard } from '@/components/AgendamentoCard';
import { Agendamento } from '@/types';

const agendamentoMock: Agendamento = {
  id: 1,
  titulo: 'Orientação TCC',
  descricao: 'Revisão do capítulo 3',
  dataHora: '2099-06-15T14:00:00.000Z',
  tipo: 'orientacao',
  status: 'pendente',
  usuarioId: 1,
  criadoEm: '2026-06-01T00:00:00.000Z',
};

describe('AgendamentoCard', () => {

  it('deve renderizar o título do agendamento', () => {
    render(<AgendamentoCard agendamento={agendamentoMock} onPress={jest.fn()} />);
    expect(screen.getByText('Orientação TCC')).toBeTruthy();
  });

  it('deve chamar onPress ao tocar no card', () => {
    const onPress = jest.fn();
    render(<AgendamentoCard agendamento={agendamentoMock} onPress={onPress} />);
    // Usa getByText em vez de getByRole('button') porque o mock do
    // react-native representa TouchableOpacity como string — o RNTL
    // não consegue resolver o accessibilityRole a partir de uma string.
    // O comportamento real (pressionar o card pelo título) é equivalente.
    fireEvent.press(screen.getByText('Orientação TCC'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('deve exibir botão de cancelar para agendamentos pendentes', () => {
    const onCancelar = jest.fn();
    render(
      <AgendamentoCard
        agendamento={agendamentoMock}
        onPress={jest.fn()}
        onCancelar={onCancelar}
      />
    );
    expect(screen.getByText('Cancelar')).toBeTruthy();
  });

  it('deve chamar onCancelar ao pressionar o botão Cancelar', () => {
    const onCancelar = jest.fn();
    render(
      <AgendamentoCard
        agendamento={agendamentoMock}
        onPress={jest.fn()}
        onCancelar={onCancelar}
      />
    );
    fireEvent.press(screen.getByText('Cancelar'));
    expect(onCancelar).toHaveBeenCalledTimes(1);
  });

  it('NÃO deve exibir botão de cancelar para agendamentos confirmados', () => {
    const confirmado = { ...agendamentoMock, status: 'confirmado' as const };
    render(
      <AgendamentoCard
        agendamento={confirmado}
        onPress={jest.fn()}
        onCancelar={jest.fn()}
      />
    );
    expect(screen.queryByText('Cancelar')).toBeNull();
  });

  it('deve exibir o tipo formatado corretamente', () => {
    render(<AgendamentoCard agendamento={agendamentoMock} onPress={jest.fn()} />);
    expect(screen.getByText('Orientação')).toBeTruthy();
  });
});