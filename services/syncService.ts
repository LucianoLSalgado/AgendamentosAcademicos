// services/syncService.ts
//
// Responsável por:
//   1. Criar a tabela sync_queue no SQLite (chamado em initDatabase)
//   2. Enfileirar operações feitas offline
//   3. Processar a fila quando a rede volta
//
// Fluxo:
//   offline: criar/cancelar/deletar → grava na sync_queue + atualiza SQLite local
//   online volta → processQueue() → repete cada operação na API → remove da fila

import * as SQLite from 'expo-sqlite';
import api from './api';

const db = SQLite.openDatabaseSync('agendamentos.db');

// ── Tipos ────────────────────────────────────────────────────────────────
export type SyncOperation = 'CREATE' | 'UPDATE' | 'CANCEL' | 'DELETE';

interface SyncItem {
    id: number;
    operacao: SyncOperation;
    payload: string; // JSON serializado
    tentativas: number;
    criadoEm: string;
}

// ── Inicialização (chamada dentro de initDatabase) ───────────────────────
export async function initSyncQueue(): Promise<void> {
    await db.execAsync(`
    CREATE TABLE IF NOT EXISTS sync_queue (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      operacao   TEXT    NOT NULL,
      payload    TEXT    NOT NULL DEFAULT '{}',
      tentativas INTEGER NOT NULL DEFAULT 0,
      criado_em  TEXT    NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

// ── Enfileirar operação offline ──────────────────────────────────────────
export async function enqueueOperation(
    operacao: SyncOperation,
    payload: object
): Promise<void> {
    await db.runAsync(
        `INSERT INTO sync_queue (operacao, payload) VALUES (?, ?)`,
        [operacao, JSON.stringify(payload)]
    );
}

// ── Processar fila quando voltar a rede ──────────────────────────────────
// Chamada em useNetworkStatus quando isConnected muda de false → true
export async function processQueue(): Promise<void> {
    const itens = await db.getAllAsync<SyncItem>(
        `SELECT * FROM sync_queue ORDER BY criado_em ASC`
    );

    if (itens.length === 0) return;

    console.log(`[Sync] Processando ${itens.length} operação(ões) pendente(s)...`);

    for (const item of itens) {
        try {
            const payload = JSON.parse(item.payload);
            await executarOperacao(item.operacao, payload);
            // Sucesso: remove da fila
            await db.runAsync(`DELETE FROM sync_queue WHERE id = ?`, [item.id]);
            console.log(`[Sync] ✅ ${item.operacao} id=${item.id} sincronizado`);
        } catch (err: any) {
            // Falha: incrementa tentativas (abandona após 5)
            const novasTentativas = item.tentativas + 1;
            if (novasTentativas >= 5) {
                await db.runAsync(`DELETE FROM sync_queue WHERE id = ?`, [item.id]);
                console.warn(`[Sync] ⚠️ Descartando ${item.operacao} id=${item.id} após 5 tentativas`);
            } else {
                await db.runAsync(
                    `UPDATE sync_queue SET tentativas = ? WHERE id = ?`,
                    [novasTentativas, item.id]
                );
                console.warn(`[Sync] ⏳ ${item.operacao} id=${item.id} falhou (tentativa ${novasTentativas}/5)`);
            }
        }
    }
}

// ── Verificar se há itens na fila ────────────────────────────────────────
export async function hasPendingSync(): Promise<boolean> {
    const row = await db.getFirstAsync<{ total: number }>(
        `SELECT COUNT(*) as total FROM sync_queue`
    );
    return (row?.total ?? 0) > 0;
}

// ── Roteador de operações → API ──────────────────────────────────────────
async function executarOperacao(
    operacao: SyncOperation,
    payload: any
): Promise<void> {
    switch (operacao) {
        case 'CREATE':
            await api.post('/agendamentos', {
                titulo: payload.titulo,
                descricao: payload.descricao,
                dataHora: payload.dataHora,
                tipo: payload.tipo,
            });
            break;

        case 'UPDATE':
            await api.put(`/agendamentos/${payload.id}`, {
                titulo: payload.titulo,
                descricao: payload.descricao,
                dataHora: payload.dataHora,
                tipo: payload.tipo,
                status: payload.status,
            });
            break;

        case 'CANCEL':
            await api.patch(`/agendamentos/${payload.id}/cancelar`);
            break;

        case 'DELETE':
            await api.delete(`/agendamentos/${payload.id}`);
            break;

        default:
            throw new Error(`Operação desconhecida: ${operacao}`);
    }
}