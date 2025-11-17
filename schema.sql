-- Schema para o sistema NotaDez
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS instituicoes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  cor TEXT
);

CREATE TABLE IF NOT EXISTS disciplinas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  instituicao_id INTEGER NOT NULL REFERENCES instituicoes(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  codigo TEXT,
  cor TEXT
);

-- turmas usam o id gerado no cliente (ex: 'turma_...'), manter TEXT como PK
CREATE TABLE IF NOT EXISTS turmas (
  id TEXT PRIMARY KEY,
  disciplina_id INTEGER NOT NULL REFERENCES disciplinas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS avaliacoes (
  id TEXT PRIMARY KEY,
  turma_id TEXT NOT NULL REFERENCES turmas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  percentual REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS alunos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  matricula TEXT,
  nome TEXT NOT NULL,
  turma_id TEXT REFERENCES turmas(id) ON DELETE SET NULL,
  extras TEXT -- JSON string for extra columns
);

CREATE TABLE IF NOT EXISTS notas (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  aluno_id INTEGER NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
  avaliacao_id TEXT NOT NULL REFERENCES avaliacoes(id) ON DELETE CASCADE,
  valor REAL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS logs (
  id TEXT PRIMARY KEY,
  timestamp TEXT,
  user TEXT,
  message TEXT
);

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  telefone TEXT,
  senha_hash TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_disciplinas_instituicao ON disciplinas(instituicao_id);
CREATE INDEX IF NOT EXISTS idx_turmas_disciplina ON turmas(disciplina_id);
CREATE INDEX IF NOT EXISTS idx_alunos_turma ON alunos(turma_id);
