# NotaDez — Backend local (SQLite)

Resumo rápido
- Este backend simples cria um banco SQLite (`notadez.db`) a partir de `schema.sql` e expõe APIs REST em `/api/*`.

Instalação e execução (Windows PowerShell)
```powershell
cd "c:\Users\broge\OneDrive\Área de Trabalho\ES-PI2-2025-T2-G05-1.0.1-login-e-pagina-de-espera"
npm install
npm start
```

Endpoints principais (exemplos)
- `GET /api/instituicoes`
- `POST /api/instituicoes` { nome, cor }
- `GET /api/disciplinas?instituicao_id=1`
- `POST /api/disciplinas` { instituicao_id, nome, codigo, cor }
- `GET /api/turmas?disciplina_id=1`
- `POST /api/turmas` { id?, disciplina_id, nome }
- `GET /api/avaliacoes?turma_id=turma_...`
- `POST /api/notas` { aluno_id, avaliacao_id, valor }
- `POST /api/logs` { logs: [ ... ] }
- `POST /api/users/register` { nome, email, senha }
- `POST /api/users/login` { email, senha }

Observações
- O frontend atual usa `localStorage`; integrar com esse backend exige alterar chamadas para `fetch('/api/...')` e migrar dados do localStorage para o servidor (pode ser feito exportando o JSON e importando via scripts).
- Senhas são armazenadas com `bcrypt`.
