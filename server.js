const express = require('express');
const bodyParser = require('express').json;
const bcrypt = require('bcrypt');
const db = require('./db_adapter');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const app = express();
app.use(bodyParser());

// If running with SQLite, ensure password_resets exists (Oracle uses schema_oracle.sql)
if ((process.env.DB_TYPE || 'sqlite').toLowerCase() !== 'oracle') {
  const sqliteSchema = `
CREATE TABLE IF NOT EXISTS password_resets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at INTEGER NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token);
`;
  db.exec(sqliteSchema, (err) => {
    if (err) console.error('Erro ao garantir tabela password_resets:', err);
  });
}

// preparar transporte de email de teste (Ethereal) para demo local
let mailTransporter = null;
async function initMailer() {
  try {
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      mailTransporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
        secure: (process.env.SMTP_SECURE === 'true') || false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });
      console.log('SMTP transport configured from environment variables. Using real SMTP.');
    } else {
      const testAccount = await nodemailer.createTestAccount();
      mailTransporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: { user: testAccount.user, pass: testAccount.pass }
      });
      console.log('Ethereal test account ready. Preview URLs will be available in responses.');
    }
  } catch (err) {
    console.error('Erro inicializando mailer:', err);
    mailTransporter = null;
  }
}
initMailer();
// CORS simples para desenvolvimento local (frontend está em arquivos locais)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  next();
});

// INSTITUICOES
app.get('/api/instituicoes', (req, res) => {
  db.all('SELECT * FROM instituicoes', (err, rows) => {
    if (err) return res.status(500).json({ error: String(err) });
    res.json(rows);
  });
});

app.post('/api/instituicoes', (req, res) => {
  const { nome, cor } = req.body;
  if (!nome) return res.status(400).json({ error: 'nome required' });
  db.run('INSERT INTO instituicoes (nome, cor) VALUES (?, ?)', [nome, cor || null], function(err) {
    if (err) return res.status(500).json({ error: String(err) });
    res.json({ id: this.lastID, nome, cor });
  });
});

// DISCIPLINAS
app.get('/api/disciplinas', (req, res) => {
  const { instituicao_id } = req.query;
  if (!instituicao_id) return res.status(400).json({ error: 'instituicao_id required' });
  db.all('SELECT * FROM disciplinas WHERE instituicao_id = ?', [instituicao_id], (err, rows) => {
    if (err) return res.status(500).json({ error: String(err) });
    res.json(rows);
  });
});

app.post('/api/disciplinas', (req, res) => {
  const { instituicao_id, nome, codigo, cor } = req.body;
  if (!instituicao_id || !nome) return res.status(400).json({ error: 'instituicao_id and nome required' });
  db.run('INSERT INTO disciplinas (instituicao_id, nome, codigo, cor) VALUES (?,?,?,?)', [instituicao_id, nome, codigo || null, cor || null], function(err) {
    if (err) return res.status(500).json({ error: String(err) });
    res.json({ id: this.lastID, instituicao_id, nome, codigo, cor });
  });
});

// TURMAS
app.get('/api/turmas', (req, res) => {
  const { disciplina_id } = req.query;
  if (!disciplina_id) return res.status(400).json({ error: 'disciplina_id required' });
  db.all('SELECT * FROM turmas WHERE disciplina_id = ?', [disciplina_id], (err, rows) => {
    if (err) return res.status(500).json({ error: String(err) });
    res.json(rows);
  });
});

app.post('/api/turmas', (req, res) => {
  let { id, disciplina_id, nome } = req.body;
  if (!disciplina_id || !nome) return res.status(400).json({ error: 'disciplina_id and nome required' });
  if (!id) id = 'turma_' + Date.now();
  db.run('INSERT INTO turmas (id, disciplina_id, nome) VALUES (?,?,?)', [id, disciplina_id, nome], function(err) {
    if (err) return res.status(500).json({ error: String(err) });
    res.json({ id, disciplina_id, nome });
  });
});

// AVALIACOES
app.get('/api/avaliacoes', (req, res) => {
  const { turma_id } = req.query;
  if (!turma_id) return res.status(400).json({ error: 'turma_id required' });
  db.all('SELECT * FROM avaliacoes WHERE turma_id = ?', [turma_id], (err, rows) => {
    if (err) return res.status(500).json({ error: String(err) });
    res.json(rows);
  });
});

app.post('/api/avaliacoes', (req, res) => {
  const { id, turma_id, nome, percentual } = req.body;
  if (!turma_id || !nome || percentual == null) return res.status(400).json({ error: 'turma_id, nome and percentual required' });
  const avalId = id || ('aval_' + Date.now() + '_' + Math.floor(Math.random()*1000));
  db.run('INSERT INTO avaliacoes (id, turma_id, nome, percentual) VALUES (?,?,?,?)', [avalId, turma_id, nome, percentual], function(err) {
    if (err) return res.status(500).json({ error: String(err) });
    res.json({ id: avalId, turma_id, nome, percentual });
  });
});

// ALUNOS
app.get('/api/alunos', (req, res) => {
  const { turma_id } = req.query;
  if (!turma_id) return res.status(400).json({ error: 'turma_id required' });
  db.all('SELECT * FROM alunos WHERE turma_id = ?', [turma_id], (err, rows) => {
    if (err) return res.status(500).json({ error: String(err) });
    res.json(rows);
  });
});

app.post('/api/alunos', (req, res) => {
  const { matricula, nome, turma_id, extras } = req.body;
  if (!nome || !turma_id) return res.status(400).json({ error: 'nome and turma_id required' });
  db.run('INSERT INTO alunos (matricula, nome, turma_id, extras) VALUES (?,?,?,?)', [matricula || null, nome, turma_id, extras ? JSON.stringify(extras) : null], function(err) {
    if (err) return res.status(500).json({ error: String(err) });
    res.json({ id: this.lastID, matricula, nome, turma_id, extras });
  });
});

// NOTAS (criar/atualizar por aluno+avaliacao)
app.post('/api/notas', (req, res) => {
  const { aluno_id, avaliacao_id, valor } = req.body;
  if (!aluno_id || !avaliacao_id || valor == null) return res.status(400).json({ error: 'aluno_id, avaliacao_id and valor required' });
  // tentar atualizar, se não existir inserir
  db.get('SELECT id FROM notas WHERE aluno_id = ? AND avaliacao_id = ?', [aluno_id, avaliacao_id], (err, row) => {
    if (err) return res.status(500).json({ error: String(err) });
    if (row) {
      db.run('UPDATE notas SET valor = ? WHERE id = ?', [valor, row.id], function(err) {
        if (err) return res.status(500).json({ error: String(err) });
        res.json({ ok: true });
      });
    } else {
      db.run('INSERT INTO notas (aluno_id, avaliacao_id, valor) VALUES (?,?,?)', [aluno_id, avaliacao_id, valor], function(err) {
        if (err) return res.status(500).json({ error: String(err) });
        res.json({ id: this.lastID, aluno_id, avaliacao_id, valor });
      });
    }
  });
});

// LOGS (recebe array de logs ou um único log)
app.post('/api/logs', (req, res) => {
  const payload = req.body.logs || (req.body.id ? [req.body] : []);
  if (!Array.isArray(payload) || payload.length === 0) return res.status(400).json({ error: 'logs array required' });
  const stmt = db.prepare('INSERT OR REPLACE INTO logs (id, timestamp, user, message) VALUES (?,?,?,?)');
  payload.forEach(l => {
    stmt.run([l.id, l.timestamp, l.user, l.message]);
  });
  stmt.finalize(err => {
    if (err) return res.status(500).json({ error: String(err) });
    res.json({ ok: true, received: payload.length });
  });
});

// USERS (registro e login simples)
app.post('/api/users/register', async (req, res) => {
  const { nome, email, telefone, senha } = req.body;
  if (!nome || !email || !senha) return res.status(400).json({ error: 'nome, email e senha required' });
  try {
    const hash = await bcrypt.hash(senha, 10);
    db.run('INSERT INTO users (nome, email, telefone, senha_hash) VALUES (?,?,?,?)', [nome, email, telefone || null, hash], function(err) {
      if (err) return res.status(500).json({ error: String(err) });
      res.json({ id: this.lastID, nome, email, telefone });
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.post('/api/users/login', (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) return res.status(400).json({ error: 'email and senha required' });
  db.get('SELECT id, nome, email, senha_hash FROM users WHERE email = ?', [email], async (err, row) => {
    if (err) return res.status(500).json({ error: String(err) });
    if (!row) return res.status(401).json({ error: 'invalid credentials' });
    const ok = await bcrypt.compare(senha, row.senha_hash);
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });
    res.json({ id: row.id, nome: row.nome, email: row.email });
  });
});

// Esqueci a senha: gerar token e enviar email de demonstração (Ethereal)
app.post('/api/users/forgot', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'email required' });
  db.get('SELECT id, nome, email FROM users WHERE email = ?', [email], (err, user) => {
    if (err) return res.status(500).json({ error: String(err) });
    if (!user) return res.status(404).json({ error: 'user not found' });
    // For demo: generate a 4-digit numeric code and store as token
    const code = String(Math.floor(1000 + Math.random() * 9000));
    const expires = Date.now() + 1000 * 60 * 60; // 1 hora
    db.run('INSERT INTO password_resets (user_id, token, expires_at) VALUES (?,?,?)', [user.id, code, expires], function(err) {
      if (err) return res.status(500).json({ error: String(err) });
      // send code via email for demo and also return it in response for local demo
      const sendMail = async () => {
        try {
          if (!mailTransporter) {
            const testAccount = await nodemailer.createTestAccount();
            mailTransporter = nodemailer.createTransport({
              host: testAccount.smtp.host,
              port: testAccount.smtp.port,
              secure: testAccount.smtp.secure,
              auth: { user: testAccount.user, pass: testAccount.pass }
            });
          }
          const html = `<p>Olá <strong>${user.nome}</strong>,</p><p>Use o código <strong>${code}</strong> para redefinir sua senha (válido por 1 hora).</p>`;
          const info = await mailTransporter.sendMail({
            from: 'no-reply@notadez.local',
            to: user.email,
            subject: 'Recuperação de senha - NotaDez (demo)',
            text: `Olá ${user.nome}, use o código: ${code}`,
            html
          });
          const preview = nodemailer.getTestMessageUrl(info) || null;
          // return code in response for local demo (so frontend can show the input)
          res.json({ ok: true, preview, code });
        } catch (e) {
          console.error('Erro ao enviar email de recuperação:', e);
          // still return the code in response for local demo, even if mail failed
          res.json({ ok: true, code });
        }
      };
      sendMail();
    });
  });
});

// Reset de senha usando token
app.post('/api/users/reset', async (req, res) => {
  const { token, senha } = req.body;
  if (!token || !senha) return res.status(400).json({ error: 'token and senha required' });
  db.get('SELECT id, user_id, expires_at FROM password_resets WHERE token = ?', [token], async (err, row) => {
    if (err) return res.status(500).json({ error: String(err) });
    if (!row) return res.status(400).json({ error: 'invalid token' });
    if (Date.now() > row.expires_at) return res.status(400).json({ error: 'token expired' });
    try {
      const hash = await bcrypt.hash(senha, 10);
      db.run('UPDATE users SET senha_hash = ? WHERE id = ?', [hash, row.user_id], function(err) {
        if (err) return res.status(500).json({ error: String(err) });
        // remover token
        db.run('DELETE FROM password_resets WHERE id = ?', [row.id]);
        res.json({ ok: true });
      });
    } catch (e) {
      res.status(500).json({ error: String(e) });
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
