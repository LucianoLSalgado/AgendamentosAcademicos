// services/database.ts
//
// MUDANÇAS em relação à versão anterior:
//   • initDatabase() agora chama initSyncQueue() — cria tabela sync_queue
//   • criarAgendamento / cancelarAgendamento / deletarAgendamento / atualizarAgendamento
//     recebem parâmetro opcional `isConnected` (default true)
//   • Quando offline: operação vai para a sync_queue além de ser gravada localmente
//
import * as SQLite from 'expo-sqlite';
import { Agendamento, NovoAgendamento, AtualizacaoAgendamento } from '@/types';
import { initSyncQueue, enqueueOperation } from './syncService';

const db = SQLite.openDatabaseSync('agendamentos.db');

// ── INICIALIZAÇÃO ────────────────────────────────────────────────────────
export async function initDatabase(): Promise<void> {
    await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS usuarios (
      id        INTEGER PRIMARY KEY,
      nome      TEXT    NOT NULL,
      email     TEXT    NOT NULL UNIQUE,
      tipo      TEXT    NOT NULL DEFAULT 'aluno',
      criado_em TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS agendamentos (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo      TEXT    NOT NULL,
      descricao   TEXT    NOT NULL DEFAULT '',
      data_hora   TEXT    NOT NULL,
      tipo        TEXT    NOT NULL DEFAULT 'atendimento',
      status      TEXT    NOT NULL DEFAULT 'pendente',
      usuario_id  INTEGER NOT NULL,
      criado_em   TEXT    NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_agendamentos_usuario
      ON agendamentos(usuario_id);

    CREATE INDEX IF NOT EXISTS idx_agendamentos_status
      ON agendamentos(status);
  `);

    // Cria a tabela de fila de sincronização (híbrido offline→online)
    await initSyncQueue();
}

// ── CRIAR ────────────────────────────────────────────────────────────────
export async function criarAgendamento(
    dados: NovoAgendamento,
    isConnected = true
): Promise<number> {
    const resultado = await db.runAsync(
        `INSERT INTO agendamentos (titulo, descricao, data_hora, tipo, usuario_id)
     VALUES (?, ?, ?, ?, ?)`,
        [dados.titulo, dados.descricao, dados.dataHora, dados.tipo, dados.usuarioId]
    );

    // Se offline, enfileira para sincronizar depois
    if (!isConnected) {
        await enqueueOperation('CREATE', dados);
    }

    return resultado.lastInsertRowId;
}

// ── LER TODOS ────────────────────────────────────────────────────────────
export async function buscarAgendamentos(usuarioId: number): Promise<Agendamento[]> {
    const rows = await db.getAllAsync<{
        id: number; titulo: string; descricao: string;
        data_hora: string; tipo: string; status: string;
        usuario_id: number; criado_em: string;
    }>(
        `SELECT * FROM agendamentos
     WHERE usuario_id = ?
     ORDER BY data_hora ASC`,
        [usuarioId]
    );
    return rows.map(r => ({
        id: r.id,
        titulo: r.titulo,
        descricao: r.descricao,
        dataHora: r.data_hora,
        tipo: r.tipo as any,
        status: r.status as any,
        usuarioId: r.usuario_id,
        criadoEm: r.criado_em,
    }));
}

// ── LER UM ───────────────────────────────────────────────────────────────
export async function buscarAgendamentoPorId(id: number): Promise<Agendamento | null> {
    const row = await db.getFirstAsync<any>(
        'SELECT * FROM agendamentos WHERE id = ?', [id]
    );
    if (!row) return null;
    return {
        id: row.id, titulo: row.titulo, descricao: row.descricao,
        dataHora: row.data_hora, tipo: row.tipo, status: row.status,
        usuarioId: row.usuario_id, criadoEm: row.criado_em,
    };
}

// ── ATUALIZAR ────────────────────────────────────────────────────────────
export async function atualizarAgendamento(
    dados: AtualizacaoAgendamento,
    isConnected = true
): Promise<void> {
    // Busca o registro atual para fazer merge seguro
    const atual = await buscarAgendamentoPorId(dados.id);
    if (!atual) throw new Error(`Agendamento ${dados.id} não encontrado`);

    // Campos ausentes em 'dados' mantêm o valor atual do banco
    await db.runAsync(
        `UPDATE agendamentos
     SET titulo = ?, descricao = ?, data_hora = ?, tipo = ?, status = ?
     WHERE id = ?`,
        [
            dados.titulo ?? atual.titulo,
            dados.descricao ?? atual.descricao,
            dados.dataHora ?? atual.dataHora,
            dados.tipo ?? atual.tipo,
            dados.status ?? atual.status,
            dados.id,
        ]
    );

    if (!isConnected) {
        await enqueueOperation('UPDATE', dados);
    }
}
// ── CANCELAR ─────────────────────────────────────────────────────────────
export async function cancelarAgendamento(
    id: number,
    isConnected = true
): Promise<void> {
    await db.runAsync(
        `UPDATE agendamentos SET status = 'cancelado' WHERE id = ?`, [id]
    );

    if (!isConnected) {
        await enqueueOperation('CANCEL', { id });
    }
}

// ── DELETAR ───────────────────────────────────────────────────────────────
export async function deletarAgendamento(
    id: number,
    isConnected = true
): Promise<void> {
    await db.runAsync('DELETE FROM agendamentos WHERE id = ?', [id]);

    if (!isConnected) {
        await enqueueOperation('DELETE', { id });
    }
}

// ── SALVAR USUÁRIO LOCAL ──────────────────────────────────────────────────
export async function salvarUsuarioLocal(u: {
    id: number; nome: string; email: string; tipo: string;
}): Promise<void> {
    await db.runAsync(
        `INSERT OR REPLACE INTO usuarios (id, nome, email, tipo) VALUES (?,?,?,?)`,
        [u.id, u.nome, u.email, u.tipo]
    );
}

// ── BUSCAR USUÁRIO LOCAL ──────────────────────────────────────────────────
export async function buscarUsuarioLocalPorEmail(email: string): Promise<{
    id: number; nome: string; email: string; tipo: string;
} | null> {
    return db.getFirstAsync<any>(
        `SELECT id, nome, email, tipo FROM usuarios WHERE email = ?`, [email]
    );
}