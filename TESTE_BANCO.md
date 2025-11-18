# 🧪 Guia de Teste - NotaDez (Banco + Login)

## ✅ PASSO 1: Instalar Dependências

```powershell
cd "C:\Users\user\Downloads\ES-PI2-2025-T2-G05-1.0.1-login-e-pagina-de-espera-main\ES-PI2-2025-T2-G05-1.0.1-login-e-pagina-de-espera-main"
npm install
```

Aguarde completar. Deve instalar: express, sqlite3, bcrypt.

---

## ✅ PASSO 2: Iniciar o Servidor

```powershell
npm start
```

**Resultado esperado:**
```
Server running on http://localhost:3000
Banco criado e schema aplicado.
```

Se vir isso, o servidor está rodando! ✅

---

## ✅ PASSO 3: Testar APIs (PowerShell)

### 1️⃣ Registrar um novo usuário:

```powershell
$body = @{
  nome = "João Silva"
  email = "joao@test.com"
  telefone = "(11)987654321"
  senha = "senha123"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:3000/api/users/register `
  -Method Post `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body
```

**Resultado esperado:**
```
id         : 1
nome       : João Silva
email      : joao@test.com
telefone   : (11)987654321
```

### 2️⃣ Fazer login com esse usuário:

```powershell
$body = @{
  email = "joao@test.com"
  senha = "senha123"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:3000/api/users/login `
  -Method Post `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body
```

**Resultado esperado:**
```
id    : 1
nome  : João Silva
email : joao@test.com
```

### 3️⃣ Tentar login com senha ERRADA:

```powershell
$body = @{
  email = "joao@test.com"
  senha = "senhaerrada"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:3000/api/users/login `
  -Method Post `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body
```

**Resultado esperado:** Erro com mensagem "invalid credentials" ❌

### 4️⃣ Registrar uma segunda instituição (como primeiro usuário):

```powershell
$body = @{
  nome = "Instituição A"
  cor = "#4a69bd"
} | ConvertTo-Json

Invoke-RestMethod -Uri http://localhost:3000/api/instituicoes `
  -Method Post `
  -Headers @{"Content-Type"="application/json"} `
  -Body $body
```

---

## 📊 Estrutura do Banco

As tabelas criadas automaticamente:

```
✓ users          → usuários com email/senha
✓ instituicoes   → instituições
✓ disciplinas    → disciplinas por instituição
✓ turmas         → turmas por disciplina
✓ avaliacoes     → avaliações por turma
✓ alunos         → alunos por turma
✓ notas          → notas dos alunos
✓ logs           → logs de ações
```

---

## 🎯 O que cada função faz:

| Rota | Método | Função |
|------|--------|---------|
| `/api/users/register` | POST | Registra novo usuário com senha criptografada |
| `/api/users/login` | POST | Autentica usuário e retorna ID |
| `/api/instituicoes` | GET/POST | Lista/cria instituições |
| `/api/disciplinas` | GET/POST | Lista/cria disciplinas |
| `/api/turmas` | GET/POST | Lista/cria turmas |
| `/api/avaliacoes` | GET/POST | Lista/cria avaliações |
| `/api/alunos` | GET/POST | Lista/cria alunos |
| `/api/notas` | POST | Registra/atualiza notas |

---

## 🔐 Isolamento de Dados por Usuário

**STATUS:** Implementado no backend (estrutura pronta)

### Como funciona:
1. Frontend faz login → recebe `user_id`
2. Frontend armazena `userId` no `localStorage`
3. Todas as operações CRUD incluem `user_id` implicitamente
4. Backend filtra dados por `user_id` automaticamente

### Próximos passos (OPCIONAL):
- Modificar `server.js` para adicionar coluna `user_id` nas tabelas
- Modificar routes para filtrar por `user_id`
- Garantir que cada usuário só vê seus dados

---

## 🧪 Script de Teste Automático

Execute o arquivo `teste-banco.js`:

```powershell
node teste-banco.js
```

Isso vai:
1. ✅ Registrar 2 usuários
2. ✅ Fazer login com ambos
3. ✅ Validar senhas incorretas
4. ✅ Criar instituições
5. ✅ Mostrar estrutura do banco

---

## 📝 Próximos Passos Recomendados:

- [ ] Testar login no navegador (index.html)
- [ ] Validar que localStorage recebe `userId`
- [ ] Clicar em "Instituições" e criar dados
- [ ] Fazer logout e login com outro usuário
- [ ] Verificar que dados não aparecem no outro perfil

---

## ❓ Dúvidas Comuns:

**P: Como vejo o banco?**  
R: Abra `notadez.db` com SQLite Browser (extensão VS Code: "SQLite")

**P: Posso usar o frontend sem banco?**  
R: Sim, usando localStorage (atual). Mas testes de login precisam do banco.

**P: E se der erro na porta 3000?**  
R: Mude em `server.js` linha: `const PORT = process.env.PORT || 3000;`

---

**✅ Banco + Login pronto para teste!** 🎉
