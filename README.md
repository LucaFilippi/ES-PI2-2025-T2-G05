# NotaDez — Demo de Banco e Recuperação de Senha

Este repositório contém um backend leve (Express + SQLite) para o projeto NotaDez. Use este guia para demonstrar ao professor que o banco está funcional e que o fluxo de recuperação de senha (token + email) funciona localmente usando uma conta de teste Ethereal.

Resumo rápido
- Backend: `node server.js` (porta 3000 por padrão)
- Frontend (demo): arquivos estáticos (ex: `recuperar.html`) servidos localmente no `http://localhost:5500`
- Banco: arquivo SQLite `notadez.db` na raiz do projeto (criado automaticamente ao iniciar o backend)

Comandos essenciais (PowerShell)

1) Instalar dependências
```powershell
npm install
```

2) Iniciar o backend
```powershell
node server.js
```

3) Registrar usuário de teste
```powershell
$body = @{ nome='Demo User'; email='demo@example.com'; telefone=''; senha='senha123' } | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:3000/api/users/register' -Method POST -Body $body -ContentType 'application/json'
```

4) Disparar fluxo "Esqueci a senha" (gera token e envia email de teste)
```powershell
$body = @{ email='demo@example.com' } | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:3000/api/users/forgot' -Method POST -Body $body -ContentType 'application/json'
```

Saída esperada: JSON contendo `preview` (URL Ethereal para visualizar o email) e `resetLink` (link apontando para o frontend, ex.: `http://localhost:5500/recuperar.html?token=...`). Exemplo retornado pelo sistema de demo:

```
{
  "ok": true,
  "preview": "https://ethereal.email/message/…",
  "resetLink": "http://localhost:5500/recuperar.html?token=..."
}
```

5) Resetar a senha com o token recebido
```powershell
$body = @{ token='<TOKEN_AQUI>'; senha='novaSenha123' } | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:3000/api/users/reset' -Method POST -Body $body -ContentType 'application/json'
```

6) Verificar login com nova senha
```powershell
$login = @{ email='demo@example.com'; senha='novaSenha123' } | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:3000/api/users/login' -Method POST -Body $login -ContentType 'application/json'
```

O que mostrar ao professor
- Mostrar a `preview` do email (Ethereal) retornada pela chamada `/api/users/forgot` — abrir a URL no navegador e mostrá-la.  
- Mostrar o `resetLink` incluído na resposta (aponta para `recuperar.html` no frontend) e que o token existe na tabela `password_resets` do banco.  
- Mostrar `notadez.db` (arquivo SQLite) com um cliente SQLite ou `sqlite3` CLI para listar dados (ex: `SELECT * FROM users;`).

Notas técnicas
- O backend cria o esquema automaticamente ao detectar que `notadez.db` não existe, usando `schema.sql`.  
- Por demo usamos um transportador Ethereal (test SMTP). O preview do email é acessível apenas localmente via URL retornada pelo servidor (campo `preview`).  
- Se quiser apontar o link de reset para outro endereço, defina `FRONTEND_URL` antes de iniciar o servidor, por exemplo:
```powershell
$env:FRONTEND_URL = 'http://localhost:5500'
node server.js
```

Ajuda / próximos passos
- Posso adicionar um script `seed` para popular dados de exemplo.  
- Posso criar uma página `recuperar.html` que extraia o token da query e envie o `POST /api/users/reset` automaticamente para uma demo mais visual.  

Arquivo criado: `README.md`

Configurar envio de email real (opcional)
 - Por padrão o servidor usa uma conta de teste Ethereal (preview URL retornado no campo `preview`).
 - Para que os e-mails sejam enviados para uma caixa real (por exemplo o e-mail do seu professor), defina as variáveis de ambiente SMTP antes de iniciar o servidor:

PowerShell (exemplo SendGrid / SMTP genérico):
```powershell
$env:SMTP_HOST = 'smtp.sendgrid.net'
$env:SMTP_PORT = '587'
$env:SMTP_USER = 'apikey'            # SendGrid usa 'apikey' como usuário
$env:SMTP_PASS = '<SEU_API_KEY_AQUI>'
$env:SMTP_SECURE = 'false'          # 'true' se usar TLS direto na porta 465
node server.js
```

PowerShell (exemplo Gmail App Password):
```powershell
$env:SMTP_HOST = 'smtp.gmail.com'
$env:SMTP_PORT = '587'
$env:SMTP_USER = 'seu.email@gmail.com'
$env:SMTP_PASS = '<APP_PASSWORD_DO_GMAIL>'
$env:SMTP_SECURE = 'false'
node server.js
```

Observações de segurança
- Nunca comite credenciais reais no repositório. Use variáveis de ambiente no servidor de demonstração.  
- Para Gmail, gere uma App Password (recomendado) e não habilite o acesso de apps menos seguros.

Testando a entrega real
- Após iniciar o servidor com as variáveis SMTP configuradas, registre um usuário com o e-mail do professor e dispare `/api/users/forgot`. O email deverá chegar na caixa dele (ou em spam).  
- Se a entrega falhar, verifique os logs do servidor — o `mailTransporter` reporta erros de autenticação/entrega no console do Node.
# NotaDez — Backend local (SQLite)

Resumo rápido

Instalação e execução (Windows PowerShell)
```powershell
cd "c:\Users\broge\OneDrive\Área de Trabalho\ES-PI2-2025-T2-G05-1.0.1-login-e-pagina-de-espera"
npm install
npm start
```

## Rodando contra Oracle (instância remota ou local sem Docker)

Se você já possui uma instância Oracle acessível (remota ou instalada localmente sem Docker), siga estas instruções para conectar o backend diretamente à instância Oracle:

1) Variáveis de ambiente necessárias

- `DB_TYPE=oracle`
- `DB_USER` — usuário do banco (ex.: `system` ou um usuário criado para a aplicação)
- `DB_PASS` — senha do usuário
- `DB_CONNECT_STRING` — string de conexão do Oracle no formato `host:port/SERVICE_NAME` (ex.: `192.168.1.10:1521/XEPDB1`)

Exemplo PowerShell (ajuste conforme sua instância):
```powershell
$env:DB_TYPE = 'oracle'
$env:DB_USER = 'appuser'
$env:DB_PASS = 'sua_senha_aqui'
$env:DB_CONNECT_STRING = '192.168.1.10:1521/XEPDB1'
npm install
node server.js
```

2) Aplicar o schema no Oracle

O repositório inclui `schema_oracle.sql` (DDL adaptado para Oracle). Para aplicar manualmente, use uma ferramenta cliente `sqlplus` ou outra ferramenta de sua preferência:

```sql
-- no sqlplus
sqlplus appuser/sua_senha@192.168.1.10:1521/XEPDB1
@schema_oracle.sql
```

3) Testar os endpoints

Com o backend rodando, use os exemplos de `Invoke-RestMethod` no começo deste README para registrar um usuário e testar `/api/users/forgot` e `/api/users/reset`.

Observações
- Esta opção exige que você tenha acesso à instância Oracle e privilégios para criar tabelas (ou que o DBA aplique `schema_oracle.sql`).
- Mantivemos o suporte a SQLite local (arquivo `notadez.db`) para demos rápidas sem Oracle.
- Se preferir que eu remova completamente o código relacionado ao Oracle e mantenha apenas SQLite, diga e eu faço a limpeza.

Se precisar, eu forneço os comandos exatos para aplicar `schema_oracle.sql` com `sqlplus` ou com ferramentas gráficas, e posso ajustar `server.js` para apontar a um TNS ou string EZConnect específica.


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
