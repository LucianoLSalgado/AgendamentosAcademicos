// backend/server.js
// Backend para o app de Agendamentos Acadêmicos
// Porta padrão: 3000
//
//   • JWT_SECRET e REFRESH_SECRET lidos de variáveis de ambiente
//   • Falha explícita se os secrets não estiverem definidos em produção
//   • Instruções de uso com .env no comentário abaixo

// ── Para rodar localmente, crie backend/.env com:
//    JWT_SECRET=sua-chave-secreta-longa-aqui
//    REFRESH_SECRET=outra-chave-secreta-diferente
//    PORT=3000
// ─────────────────────────────────────────────────────────────────────────

require('dotenv').config(); // npm install dotenv (se não tiver)

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// ── CONFIGURAÇÃO ──────────────────────────────────────────────────────────
const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;
const PORT = process.env.PORT ?? 3000;
const JWT_EXPIRES_IN = '24h';
const REFRESH_EXPIRES_IN = '7d';

// Segurança: impede inicialização sem secrets em produção
if (process.env.NODE_ENV === 'production') {
    if (!JWT_SECRET || !REFRESH_SECRET) {
        console.error('❌ ERRO: JWT_SECRET e REFRESH_SECRET devem estar definidos em produção.');
        process.exit(1);
    }
}

// Fallback para desenvolvimento local (não usar em produção)
const jwtSecret = JWT_SECRET ?? 'dev-secret-inseguro-nao-usar-em-prod';
const refreshSecret = REFRESH_SECRET ?? 'dev-refresh-inseguro-nao-usar-em-prod';

// ── BANCO EM MEMÓRIA ──────────────────────────────────────────────────────
const db = {
    usuarios: [],
    agendamentos: [],
    refreshTokens: [],
    nextUserId: 1,
    nextAgendId: 1,
};

// ── USUÁRIO PADRÃO para demonstração ─────────────────────────────────────
; (async () => {
    const senhaHash = await bcrypt.hash('123456', 10);
    db.usuarios.push({
        id: db.nextUserId++,
        nome: 'Professor Demonstração',
        email: 'professor@fatec.br',
        senhaHash,
        tipo: 'professor',
        criadoEm: new Date().toISOString(),
    });

    const exemplos = [
        { titulo: 'Orientação TCC - João Silva', tipo: 'orientacao', status: 'confirmado', dias: 2 },
        { titulo: 'Atendimento Lab. Mobile', tipo: 'laboratorio', status: 'pendente', dias: 5 },
        { titulo: 'Reunião de Coordenação DSM', tipo: 'reuniao', status: 'pendente', dias: 7 },
        { titulo: 'Orientação TCC - Maria Santos', tipo: 'orientacao', status: 'pendente', dias: 10 },
        { titulo: 'Atendimento Dúvidas React Native', tipo: 'atendimento', status: 'cancelado', dias: -2 },
    ];

    exemplos.forEach(e => {
        const data = new Date();
        data.setDate(data.getDate() + e.dias);
        data.setHours(14, 0, 0, 0);
        db.agendamentos.push({
            id: db.nextAgendId++,
            titulo: e.titulo, descricao: '',
            dataHora: data.toISOString(),
            tipo: e.tipo, status: e.status,
            usuarioId: 1,
            criadoEm: new Date().toISOString(),
        });
    });

    console.log('\n╔══════════════════════════════════════════════════╗');
    console.log('║   Backend Agendamentos Acadêmicos — FATEC        ║');
    console.log('╠══════════════════════════════════════════════════╣');
    console.log(`║   Porta: ${PORT}                                    ║`);
    console.log('║   Usuário de demo:                               ║');
    console.log('║     E-mail: professor@fatec.br                   ║');
    console.log('║     Senha:  123456                               ║');
    console.log('╚══════════════════════════════════════════════════╝\n');
})();

// ── MIDDLEWARE: verificar JWT ─────────────────────────────────────────────
function autenticar(req, res, next) {
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer ')) {
        return res.status(401).json({ erro: 'Token não fornecido' });
    }
    const token = auth.split(' ')[1];
    try {
        const payload = jwt.verify(token, jwtSecret);
        req.usuarioId = payload.sub;
        next();
    } catch {
        return res.status(401).json({ erro: 'Token inválido ou expirado' });
    }
}

function usuarioPublico(u) {
    return { id: u.id, nome: u.nome, email: u.email, tipo: u.tipo, criadoEm: u.criadoEm };
}

function gerarTokens(usuarioId) {
    const accessToken = jwt.sign({ sub: usuarioId }, jwtSecret, { expiresIn: JWT_EXPIRES_IN });
    const refreshToken = jwt.sign({ sub: usuarioId }, refreshSecret, { expiresIn: REFRESH_EXPIRES_IN });
    db.refreshTokens.push(refreshToken);
    return { accessToken, refreshToken };
}

// ── ROTAS DE SAÚDE ────────────────────────────────────────────────────────
app.get('/', (_req, res) => res.json({ status: 'ok', app: 'Agendamentos API', versao: '1.0.0' }));
app.get('/health', (_req, res) => res.json({ status: 'ok', usuarios: db.usuarios.length, agendamentos: db.agendamentos.length }));

// ── AUTH: register ────────────────────────────────────────────────────────
app.post('/auth/register', async (req, res) => {
    try {
        const { nome, email, senha, tipo = 'aluno' } = req.body;
        if (!nome || !email || !senha) return res.status(400).json({ erro: 'nome, email e senha são obrigatórios' });
        if (senha.length < 6) return res.status(400).json({ erro: 'Senha deve ter ao menos 6 caracteres' });
        if (db.usuarios.find(u => u.email === email)) return res.status(409).json({ erro: 'E-mail já cadastrado' });

        const senhaHash = await bcrypt.hash(senha, 10);
        const novoUsuario = { id: db.nextUserId++, nome, email, senhaHash, tipo: tipo === 'professor' ? 'professor' : 'aluno', criadoEm: new Date().toISOString() };
        db.usuarios.push(novoUsuario);

        console.log(`[REGISTER] ${email} (${novoUsuario.tipo})`);
        res.status(201).json({ usuario: usuarioPublico(novoUsuario), ...gerarTokens(novoUsuario.id) });
    } catch (e) {
        console.error('[REGISTER]', e);
        res.status(500).json({ erro: 'Erro interno' });
    }
});

// ── AUTH: login ───────────────────────────────────────────────────────────
app.post('/auth/login', async (req, res) => {
    try {
        const { email, senha } = req.body;
        if (!email || !senha) return res.status(400).json({ erro: 'email e senha são obrigatórios' });

        const usuario = db.usuarios.find(u => u.email === email);
        if (!usuario || !(await bcrypt.compare(senha, usuario.senhaHash))) {
            return res.status(401).json({ erro: 'E-mail ou senha incorretos' });
        }
        console.log(`[LOGIN] ${email}`);
        res.json({ usuario: usuarioPublico(usuario), ...gerarTokens(usuario.id) });
    } catch (e) {
        console.error('[LOGIN]', e);
        res.status(500).json({ erro: 'Erro interno' });
    }
});

// ── AUTH: refresh ─────────────────────────────────────────────────────────
app.post('/auth/refresh', (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken || !db.refreshTokens.includes(refreshToken)) {
        return res.status(401).json({ erro: 'Refresh token inválido' });
    }
    try {
        const payload = jwt.verify(refreshToken, refreshSecret);
        const accessToken = jwt.sign({ sub: payload.sub }, jwtSecret, { expiresIn: JWT_EXPIRES_IN });
        res.json({ accessToken });
    } catch {
        res.status(401).json({ erro: 'Refresh token expirado' });
    }
});

// ── AUTH: logout ──────────────────────────────────────────────────────────
app.post('/auth/logout', autenticar, (req, res) => {
    const { refreshToken } = req.body;
    db.refreshTokens = db.refreshTokens.filter(t => t !== refreshToken);
    res.json({ mensagem: 'Logout realizado' });
});

// ── AUTH: me ──────────────────────────────────────────────────────────────
app.get('/auth/me', autenticar, (req, res) => {
    const usuario = db.usuarios.find(u => u.id === req.usuarioId);
    if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado' });
    res.json(usuarioPublico(usuario));
});

// ── AGENDAMENTOS: listar ──────────────────────────────────────────────────
app.get('/agendamentos', autenticar, (req, res) => {
    const { status, tipo } = req.query;
    let lista = db.agendamentos.filter(a => a.usuarioId === req.usuarioId);
    if (status) lista = lista.filter(a => a.status === status);
    if (tipo) lista = lista.filter(a => a.tipo === tipo);
    lista.sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora));
    res.json(lista);
});

// ── AGENDAMENTOS: buscar um ───────────────────────────────────────────────
app.get('/agendamentos/:id', autenticar, (req, res) => {
    const ag = db.agendamentos.find(a => a.id === parseInt(req.params.id) && a.usuarioId === req.usuarioId);
    if (!ag) return res.status(404).json({ erro: 'Agendamento não encontrado' });
    res.json(ag);
});

// ── AGENDAMENTOS: criar ───────────────────────────────────────────────────
app.post('/agendamentos', autenticar, (req, res) => {
    const { titulo, descricao = '', dataHora, tipo = 'atendimento' } = req.body;
    if (!titulo || !dataHora) return res.status(400).json({ erro: 'titulo e dataHora são obrigatórios' });

    const tiposValidos = ['orientacao', 'laboratorio', 'atendimento', 'reuniao'];
    if (!tiposValidos.includes(tipo)) return res.status(400).json({ erro: `tipo deve ser: ${tiposValidos.join(', ')}` });

    const ag = { id: db.nextAgendId++, titulo, descricao, dataHora, tipo, status: 'pendente', usuarioId: req.usuarioId, criadoEm: new Date().toISOString() };
    db.agendamentos.push(ag);
    console.log(`[CREATE] "${titulo}" uid=${req.usuarioId}`);
    res.status(201).json(ag);
});

// ── AGENDAMENTOS: atualizar ───────────────────────────────────────────────
app.put('/agendamentos/:id', autenticar, (req, res) => {
    const idx = db.agendamentos.findIndex(a => a.id === parseInt(req.params.id) && a.usuarioId === req.usuarioId);
    if (idx === -1) return res.status(404).json({ erro: 'Agendamento não encontrado' });

    const { titulo, descricao, dataHora, tipo, status } = req.body;
    const statusValidos = ['pendente', 'confirmado', 'cancelado'];
    if (status && !statusValidos.includes(status)) return res.status(400).json({ erro: `status deve ser: ${statusValidos.join(', ')}` });

    const ag = db.agendamentos[idx];
    db.agendamentos[idx] = { ...ag, titulo: titulo ?? ag.titulo, descricao: descricao ?? ag.descricao, dataHora: dataHora ?? ag.dataHora, tipo: tipo ?? ag.tipo, status: status ?? ag.status };
    console.log(`[UPDATE] id=${ag.id} status=${db.agendamentos[idx].status}`);
    res.json(db.agendamentos[idx]);
});

// ── AGENDAMENTOS: cancelar ────────────────────────────────────────────────
app.patch('/agendamentos/:id/cancelar', autenticar, (req, res) => {
    const idx = db.agendamentos.findIndex(a => a.id === parseInt(req.params.id) && a.usuarioId === req.usuarioId);
    if (idx === -1) return res.status(404).json({ erro: 'Agendamento não encontrado' });
    if (db.agendamentos[idx].status === 'cancelado') return res.status(400).json({ erro: 'Já cancelado' });

    db.agendamentos[idx].status = 'cancelado';
    console.log(`[CANCEL] id=${req.params.id}`);
    res.json(db.agendamentos[idx]);
});

// ── AGENDAMENTOS: deletar ─────────────────────────────────────────────────
app.delete('/agendamentos/:id', autenticar, (req, res) => {
    const idx = db.agendamentos.findIndex(a => a.id === parseInt(req.params.id) && a.usuarioId === req.usuarioId);
    if (idx === -1) return res.status(404).json({ erro: 'Agendamento não encontrado' });
    db.agendamentos.splice(idx, 1);
    console.log(`[DELETE] id=${req.params.id}`);
    res.status(204).send();
});

// ── INICIAR SERVIDOR ──────────────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor em http://0.0.0.0:${PORT}`);
});