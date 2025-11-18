# 📋 GUIA COMPLETO - COMO RODAR O PROJETO

## ✅ O QUE JÁ FUNCIONA

- ✅ Servidor Node.js + Express (localhost:3000)
- ✅ SQLite Database (notadez.db)
- ✅ Login e Cadastro com senha criptografada (bcrypt)
- ✅ Isolamento de dados por usuário
- ✅ Arquivo estático (HTML, CSS, JS)

---

## 📦 PRÉ-REQUISITOS

Você precisa ter instalado:
- **Node.js** (versão 14+) - Download em https://nodejs.org/
- **npm** (vem com Node.js)

Para verificar se está instalado, abra o PowerShell e digite:
```powershell
node --version
npm --version
```

Se aparecer versões, está tudo certo! ✅

---

## 🚀 PASSO A PASSO PARA RODAR

### PASSO 1: Abra o PowerShell
1. Pressione `Windows + R`
2. Digite `powershell` e pressione Enter
3. Você verá a tela preta com `PS C:\...>`

### PASSO 2: Entre na pasta do projeto
Digite este comando e pressione Enter:
```powershell
cd "C:\Users\user\Downloads\ES-PI2-2025-T2-G05-1.0.1-login-e-pagina-de-espera-main\ES-PI2-2025-T2-G05-1.0.1-login-e-pagina-de-espera-main"
```

Você deve ver algo como:
```
PS C:\Users\user\Downloads\...\main>
```

### PASSO 3: Instale as dependências (SÓ NA PRIMEIRA VEZ!)
Se for a primeira vez, execute:
```powershell
npm install
```

Vai demorar um pouco (2-5 minutos). Espere aparecer:
```
added XXX packages
```

### PASSO 4: INICIE O SERVIDOR ⚡
Digite este comando:
```powershell
npm start
```

Se tudo der certo, você verá:
```
✅ Servidor rodando em http://localhost:3000
🗄️  Conectado ao SQLite Database
```

**Não feche esta janela!** Ela precisa ficar aberta enquanto você usa o site.

---

## 🌐 ACESSE O SITE

1. Abra seu navegador (Chrome, Edge, Firefox, etc)
2. Na barra de endereço, digite:
   ```
   http://localhost:3000
   ```
3. Pressione Enter

Você verá a página de **LOGIN** do projeto! 🎉

---

## 👤 TESTE DE LOGIN

Use estas credenciais de teste (já criadas no banco):

**Usuário 1:**
- Email: `joao@test.com`
- Senha: `senha123`

**Usuário 2:**
- Email: `maria@test.com`
- Senha: `senha456`

Ou crie um novo usuário clicando em **"Cadastro"**

---

## 🛑 PARA ENCERRAR

Na janela do PowerShell onde o servidor está rodando, pressione:
```
Ctrl + C
```

Você verá:
```
🛑 Encerrando servidor...
Pool de conexão fechado
```

---

## ⚠️ PROBLEMAS COMUNS

### Erro: "Cannot GET /"
- **Solução**: Certifique-se que o servidor está rodando (viu a mensagem verde?)
- Tente acessar novamente em http://localhost:3000

### Erro: "address already in use :::3000"
- **Solução**: Outra aplicação está usando a porta 3000
- Execute no PowerShell:
  ```powershell
  Get-Process node | Stop-Process -Force
  ```
- Depois tente novamente `npm start`

### Erro: "comando não encontrado"
- **Solução**: Verifique que está na pasta correta
- Use: `cd C:\Users\user\Downloads\...` (copie o caminho exato)

### Login não funciona
- **Solução**: Certifique-se que:
  1. O servidor está rodando (você viu as mensagens verdes?)
  2. Está usando as credenciais corretas (joao@test.com / senha123)
  3. Não há erros no console do navegador (pressione F12)

---

## 📂 ESTRUTURA DO PROJETO

```
projeto/
├── server.js               ← Servidor Express (NÃO MEXA)
├── db.js                   ← Conexão SQLite (NÃO MEXA)
├── notadez.db              ← Banco de dados (criado automaticamente)
├── package.json            ← Dependências (NÃO MEXA)
│
├── index.html              ← Página de LOGIN
├── cadastro.html           ← Página de CADASTRO
├── loading.html            ← Página de CARREGAMENTO
├── instituicoes.html       ← Página de INSTITUIÇÕES
├── disciplinas.html        ← Página de DISCIPLINAS
├── turmas.html             ← Página de TURMAS
├── alunos.html             ← Página de ALUNOS
│
├── script.js               ← Funções de login/cadastro (MODIFICADO)
├── instituicoes.js         ← Lógica de instituições
├── disciplinas.js          ← Lógica de disciplinas
├── turmas.js               ← Lógica de turmas
├── alunos.js               ← Lógica de alunos
│
├── style.css               ← Estilos (MODIFICADO - PROFISSIONAL)
└── logs.js                 ← Sistema de logs
```

---

## 🔒 O QUE FOI MODIFICADO

### ✏️ script.js
- **Antes**: Login era apenas localStorage (fake)
- **Depois**: Login valida contra o banco de dados via API REST
- **Resultado**: Apenas usuários cadastrados podem entrar

### ✏️ style.css
- **Antes**: Design simples
- **Depois**: Design profissional com gradientes, sombras e responsividade
- **Resultado**: Site parece muito mais moderno

### ✏️ alunos.html
- **Antes**: Tabela muito pequena (340px)
- **Depois**: Tabela grande e profissional (até 1400px)
- **Resultado**: Dados legíveis e bonitos

### ✏️ server.js
- **Adicionado**: `app.use(express.static(__dirname))`
- **Resultado**: Servidor agora serve os arquivos HTML/CSS/JS

---

## 📊 TESTE RÁPIDO DO BANCO

Se quiser verificar se o banco está funcionando:

1. Abra **outro PowerShell** (deixe o servidor rodando no outro)
2. Entre na mesma pasta:
   ```powershell
   cd "C:\Users\user\Downloads\...main"
   ```
3. Execute o teste:
   ```powershell
   node teste-banco.js
   ```

Você verá todos os testes passando:
```
✅ Usuário registrado
✅ Login bem-sucedido
✅ Senha rejeitada corretamente
✅ Instituição criada
```

---

## 🎯 PRÓXIMAS ETAPAS

Depois de rodar com sucesso:

1. **Teste o login** no navegador com as credenciais
2. **Crie novos usuários** na página de cadastro
3. **Adicione dados** (instituições, disciplinas, turmas, alunos)
4. **Verifique o isolamento** - cada usuário vê apenas seus dados

---

## 💡 DICAS

- **Limpar cache**: Se algo estranho acontecer, pressione `Ctrl + Shift + Delete` no navegador e limpe o cache
- **Abrir console**: Pressione `F12` no navegador para ver erros detalhados
- **Resetar banco**: Delete o arquivo `notadez.db` para recriar do zero na próxima execução

---

## 📞 RESUMO DOS COMANDOS

| Comando | O que faz |
|---------|-----------|
| `npm install` | Instala dependências (1ª vez) |
| `npm start` | Inicia o servidor |
| `node teste-banco.js` | Testa a conexão com banco |
| `Ctrl + C` | Para o servidor |

---

**Pronto! Agora você consegue rodar o projeto completo!** 🚀

Se tiver qualquer dúvida, me avise! 😊
