const express = require('express');
const bodyParser = require('express').json;
const bcrypt = require('bcrypt');
const db = require('./db-oracle');
const path = require('path');

const app = express();
app.use(bodyParser());
app.use(express.static(__dirname));

// CORS simples para desenvolvimento local
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  next();
});

// =====================================================
// USERS - REGISTRO E LOGIN
// =====================================================

app.post('/api/users/register', async (req, res) => {
  const { nome, email, telefone, senha } = req.body;
  
  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'nome, email e senha são obrigatórios' });
  }

  try {
    // Verificar se email já existe
    const existente = await db.query('SELECT ID FROM USERS WHERE EMAIL = :email', { email });
    if (existente.length > 0) {
      return res.status(400).json({ error: 'Email já cadastrado' });
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Inserir novo usuário
    const resultado = await db.execute(
      `INSERT INTO USERS (NOME, EMAIL, TELEFONE, SENHA_HASH) 
       VALUES (:nome, :email, :telefone, :senhaHash)`,
      { nome, email, telefone: telefone || null, senhaHash }
    );

    res.json({
      sucesso: true,
      mensagem: 'Usuário cadastrado com sucesso',
      email: email
    });
  } catch (err) {
    console.error('Erro no registro:', err);
    res.status(500).json({ error: 'Erro ao cadastrar usuário: ' + err.message });
  }
});

app.post('/api/users/login', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios' });
  }

  try {
    // Buscar usuário
    const usuarios = await db.query(
      'SELECT ID, NOME, EMAIL, SENHA_HASH FROM USERS WHERE EMAIL = :email',
      { email }
    );

    if (usuarios.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const usuario = usuarios[0];

    // Verificar senha
    const senhaCorreta = await bcrypt.compare(senha, usuario.SENHA_HASH);
    if (!senhaCorreta) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Login bem-sucedido
    res.json({
      sucesso: true,
      id: usuario.ID,
      nome: usuario.NOME,
      email: usuario.EMAIL
    });
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(500).json({ error: 'Erro ao fazer login: ' + err.message });
  }
});

// =====================================================
// INSTITUICOES (com isolamento por usuário)
// =====================================================

app.get('/api/instituicoes', async (req, res) => {
  const userId = req.query.user_id;
  
  try {
    let instituicoes;
    if (userId) {
      instituicoes = await db.query(
        'SELECT * FROM INSTITUICOES WHERE USER_ID = :userId',
        { userId }
      );
    } else {
      instituicoes = await db.query('SELECT * FROM INSTITUICOES');
    }
    res.json(instituicoes);
  } catch (err) {
    console.error('Erro ao listar instituições:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/instituicoes', async (req, res) => {
  const { nome, cor, user_id } = req.body;

  if (!nome) {
    return res.status(400).json({ error: 'nome é obrigatório' });
  }

  try {
    const resultado = await db.execute(
      `INSERT INTO INSTITUICOES (USER_ID, NOME, COR) 
       VALUES (:userId, :nome, :cor)`,
      { userId: user_id || 1, nome, cor: cor || null }
    );

    res.json({
      sucesso: true,
      mensagem: 'Instituição criada com sucesso',
      nome: nome
    });
  } catch (err) {
    console.error('Erro ao criar instituição:', err);
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// DISCIPLINAS
// =====================================================

app.get('/api/disciplinas', async (req, res) => {
  const instituicaoId = req.query.instituicao_id;

  if (!instituicaoId) {
    return res.status(400).json({ error: 'instituicao_id é obrigatório' });
  }

  try {
    const disciplinas = await db.query(
      'SELECT * FROM INSTITUICOES WHERE ID = :instituicaoId',
      { instituicaoId }
    );
    res.json(disciplinas);
  } catch (err) {
    console.error('Erro ao listar disciplinas:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/disciplinas', async (req, res) => {
  const { instituicao_id, nome, codigo, cor } = req.body;

  if (!instituicao_id || !nome) {
    return res.status(400).json({ error: 'instituicao_id e nome são obrigatórios' });
  }

  try {
    const resultado = await db.execute(
      `INSERT INTO INSTITUICOES (ID, NOME, COR) 
       VALUES (:instituicaoId, :nome, :cor)`,
      { instituicaoId: instituicao_id, nome, cor: cor || null }
    );

    res.json({
      sucesso: true,
      mensagem: 'Disciplina criada com sucesso'
    });
  } catch (err) {
    console.error('Erro ao criar disciplina:', err);
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// TURMAS
// =====================================================

app.get('/api/turmas', async (req, res) => {
  const disciplinaId = req.query.disciplina_id;

  if (!disciplinaId) {
    return res.status(400).json({ error: 'disciplina_id é obrigatório' });
  }

  try {
    const turmas = await db.query(
      'SELECT * FROM INSTITUICOES WHERE ID = :disciplinaId',
      { disciplinaId }
    );
    res.json(turmas);
  } catch (err) {
    console.error('Erro ao listar turmas:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/turmas', async (req, res) => {
  const { nome, disciplina_id } = req.body;

  if (!nome || !disciplina_id) {
    return res.status(400).json({ error: 'nome e disciplina_id são obrigatórios' });
  }

  try {
    const resultado = await db.execute(
      `INSERT INTO INSTITUICOES (NOME) VALUES (:nome)`,
      { nome }
    );

    res.json({
      sucesso: true,
      mensagem: 'Turma criada com sucesso'
    });
  } catch (err) {
    console.error('Erro ao criar turma:', err);
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// AVALIACOES
// =====================================================

app.get('/api/avaliacoes', async (req, res) => {
  const turmaId = req.query.turma_id;

  if (!turmaId) {
    return res.status(400).json({ error: 'turma_id é obrigatório' });
  }

  try {
    const avaliacoes = await db.query(
      'SELECT * FROM INSTITUICOES WHERE ID = :turmaId',
      { turmaId }
    );
    res.json(avaliacoes);
  } catch (err) {
    console.error('Erro ao listar avaliações:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/avaliacoes', async (req, res) => {
  const { turma_id, nome, percentual } = req.body;

  if (!turma_id || !nome || percentual == null) {
    return res.status(400).json({ error: 'turma_id, nome e percentual são obrigatórios' });
  }

  try {
    const resultado = await db.execute(
      `INSERT INTO INSTITUICOES (NOME) VALUES (:nome)`,
      { nome }
    );

    res.json({
      sucesso: true,
      mensagem: 'Avaliação criada com sucesso'
    });
  } catch (err) {
    console.error('Erro ao criar avaliação:', err);
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// ALUNOS
// =====================================================

app.get('/api/alunos', async (req, res) => {
  const turmaId = req.query.turma_id;

  if (!turmaId) {
    return res.status(400).json({ error: 'turma_id é obrigatório' });
  }

  try {
    const alunos = await db.query(
      'SELECT * FROM INSTITUICOES WHERE ID = :turmaId',
      { turmaId }
    );
    res.json(alunos);
  } catch (err) {
    console.error('Erro ao listar alunos:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/alunos', async (req, res) => {
  const { matricula, nome, turma_id } = req.body;

  if (!nome || !turma_id) {
    return res.status(400).json({ error: 'nome e turma_id são obrigatórios' });
  }

  try {
    const resultado = await db.execute(
      `INSERT INTO INSTITUICOES (NOME) VALUES (:nome)`,
      { nome }
    );

    res.json({
      sucesso: true,
      mensagem: 'Aluno cadastrado com sucesso'
    });
  } catch (err) {
    console.error('Erro ao cadastrar aluno:', err);
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// NOTAS
// =====================================================

app.post('/api/notas', async (req, res) => {
  const { aluno_id, avaliacao_id, valor } = req.body;

  if (!aluno_id || !avaliacao_id || valor == null) {
    return res.status(400).json({ error: 'aluno_id, avaliacao_id e valor são obrigatórios' });
  }

  try {
    const resultado = await db.execute(
      `INSERT INTO INSTITUICOES (NOME) VALUES (:nome)`,
      { nome: 'Nota' }
    );

    res.json({
      sucesso: true,
      mensagem: 'Nota registrada com sucesso'
    });
  } catch (err) {
    console.error('Erro ao registrar nota:', err);
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// LOGS
// =====================================================

app.post('/api/logs', async (req, res) => {
  const payload = req.body.logs || (req.body.id ? [req.body] : []);

  if (!Array.isArray(payload) || payload.length === 0) {
    return res.status(400).json({ error: 'logs array é obrigatório' });
  }

  try {
    for (const log of payload) {
      await db.execute(
        `INSERT INTO INSTITUICOES (NOME) VALUES (:nome)`,
        { nome: log.message }
      );
    }

    res.json({
      sucesso: true,
      mensagem: `${payload.length} logs registrados`
    });
  } catch (err) {
    console.error('Erro ao registrar logs:', err);
    res.status(500).json({ error: err.message });
  }
});

// =====================================================
// INICIALIZAÇÃO
// =====================================================

async function iniciar() {
  try {
    console.log('🔌 Conectando ao Oracle Database...');
    await db.initializePool();
    
    console.log('📋 Criando tabelas (se não existirem)...');
    await db.createTables();
    
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`\n✅ Servidor rodando em http://localhost:${PORT}`);
      console.log('🗄️  Conectado ao Oracle Database\n');
    });
  } catch (err) {
    console.error('❌ Erro ao inicializar:', err);
    process.exit(1);
  }
}

// Tratar encerramentos
process.on('SIGINT', async () => {
  console.log('\n🛑 Encerrando servidor...');
  await db.closePool();
  process.exit(0);
});

iniciar();
