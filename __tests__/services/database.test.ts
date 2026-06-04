// __tests__/services/database.test.ts

// jest.mock é hoistado pelo Babel para antes de qualquer import.
// O factory deve declarar os jest.fn() INTERNAMENTE — não pode referenciar
// variáveis externas porque elas ainda não existem quando o factory roda.
jest.mock('expo-sqlite', () => {
  const mockDb = {
    execAsync: jest.fn().mockResolvedValue(undefined),
    runAsync: jest.fn().mockResolvedValue({ lastInsertRowId: 42, changes: 1 }),
    getAllAsync: jest.fn().mockResolvedValue([]),
    getFirstAsync: jest.fn().mockResolvedValue(null),
  };
  return {
    openDatabaseSync: jest.fn(() => mockDb),
    __mockDb: mockDb,
  };
});

import * as SQLite from 'expo-sqlite';
import {
  initDatabase,
  criarAgendamento,
  buscarAgendamentos,
  cancelarAgendamento,
  deletarAgendamento,
} from '@/services/database';

// Recupera o mockDb exportado pelo factory acima
function db() {
  return (SQLite as any).__mockDb;
}

describe('database service', () => {

  beforeEach(() => {
    const d = db();
    d.execAsync.mockClear();
    d.runAsync.mockClear();
    d.getAllAsync.mockClear();
    d.getFirstAsync.mockClear();
    // Restaura retornos padrão após cada teste
    d.runAsync.mockResolvedValue({ lastInsertRowId: 42, changes: 1 });
    d.getAllAsync.mockResolvedValue([]);
  });

  // ── initDatabase ─────────────────────────────────────────────────────────
  describe('initDatabase', () => {
    it('executa SQL com PRAGMA WAL e criação das tabelas', async () => {
      await initDatabase();
      // initDatabase chama execAsync 2x: tabelas principais + initSyncQueue
      expect(db().execAsync).toHaveBeenCalledTimes(2);
      const sql: string = db().execAsync.mock.calls[0][0];
      expect(sql).toContain('PRAGMA journal_mode = WAL');
      expect(sql).toContain('CREATE TABLE IF NOT EXISTS agendamentos');
      expect(sql).toContain('CREATE TABLE IF NOT EXISTS usuarios');
      expect(sql).toContain('CREATE INDEX IF NOT EXISTS idx_agendamentos_usuario');
    });
  });

  // ── criarAgendamento ──────────────────────────────────────────────────────
  describe('criarAgendamento', () => {
    it('retorna o lastInsertRowId do novo registro', async () => {
      const id = await criarAgendamento({
        titulo: 'Orientação TCC', descricao: 'Cap. 3',
        dataHora: '2026-06-15T14:00:00.000Z',
        tipo: 'orientacao', usuarioId: 1,
      });
      expect(id).toBe(42);
    });

    it('chama runAsync com INSERT e parâmetros corretos', async () => {
      await criarAgendamento({
        titulo: 'Lab Mobile', descricao: 'Aula prática',
        dataHora: '2026-07-01T10:00:00.000Z',
        tipo: 'laboratorio', usuarioId: 2,
      });
      const [sql, params] = db().runAsync.mock.calls[0];
      expect(sql).toContain('INSERT INTO agendamentos');
      expect(params).toContain('Lab Mobile');
      expect(params).toContain('laboratorio');
      expect(params).toContain(2);
    });
  });

  // ── buscarAgendamentos ────────────────────────────────────────────────────
  describe('buscarAgendamentos', () => {
    it('mapeia snake_case do banco para camelCase do TypeScript', async () => {
      db().getAllAsync.mockResolvedValueOnce([{
        id: 1, titulo: 'Reunião', descricao: '',
        data_hora: '2026-06-15T10:00:00Z',
        tipo: 'reuniao', status: 'pendente',
        usuario_id: 5, criado_em: '2026-06-01T00:00:00Z',
      }]);

      const resultado = await buscarAgendamentos(5);

      expect(resultado).toHaveLength(1);
      expect(resultado[0].dataHora).toBe('2026-06-15T10:00:00Z');
      expect(resultado[0].usuarioId).toBe(5);
      expect(resultado[0].criadoEm).toBe('2026-06-01T00:00:00Z');
      expect(resultado[0]).not.toHaveProperty('data_hora');
      expect(resultado[0]).not.toHaveProperty('usuario_id');
    });

    it('retorna array vazio quando não há agendamentos', async () => {
      const resultado = await buscarAgendamentos(99);
      expect(resultado).toEqual([]);
    });
  });

  // ── cancelarAgendamento ───────────────────────────────────────────────────
  describe('cancelarAgendamento', () => {
    it("atualiza status para 'cancelado' para o id correto", async () => {
      await cancelarAgendamento(7);
      const [sql, params] = db().runAsync.mock.calls[0];
      expect(sql).toContain("status = 'cancelado'");
      expect(params).toContain(7);
    });
  });

  // ── deletarAgendamento ────────────────────────────────────────────────────
  describe('deletarAgendamento', () => {
    it('executa DELETE FROM agendamentos para o id correto', async () => {
      await deletarAgendamento(3);
      const [sql, params] = db().runAsync.mock.calls[0];
      expect(sql).toContain('DELETE FROM agendamentos');
      expect(params).toContain(3);
    });
  });
});