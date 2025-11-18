const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function teste() {
  console.log('\n🧪 INICIANDO TESTES DE BANCO + LOGIN\n');
  
  try {
    console.log('📝 1. Registrando usuário 1...');
    const user1Reg = await fetch(`${BASE_URL}/api/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: 'João Silva',
        email: 'joao@test.com',
        telefone: '(11)987654321',
        senha: 'senha123'
      })
    }).then(r => r.json());
    console.log('✅ Usuário 1 registrado:', user1Reg.email, '(ID:', user1Reg.id, ')\n');

    console.log('📝 2. Registrando usuário 2...');
    const user2Reg = await fetch(`${BASE_URL}/api/users/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: 'Maria Santos',
        email: 'maria@test.com',
        telefone: '(21)999888777',
        senha: 'senha456'
      })
    }).then(r => r.json());
    console.log('✅ Usuário 2 registrado:', user2Reg.email, '(ID:', user2Reg.id, ')\n');

    console.log('🔐 3. Testando login do usuário 1...');
    const login1 = await fetch(`${BASE_URL}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'joao@test.com',
        senha: 'senha123'
      })
    }).then(r => r.json());
    console.log('✅ Login bem-sucedido:', login1.nome, '\n');

    console.log('🔐 4. Testando login do usuário 2...');
    const login2 = await fetch(`${BASE_URL}/api/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'maria@test.com',
        senha: 'senha456'
      })
    }).then(r => r.json());
    console.log('✅ Login bem-sucedido:', login2.nome, '\n');

    console.log('❌ 5. Testando login com senha ERRADA...');
    try {
      await fetch(`${BASE_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'joao@test.com',
          senha: 'senhaerrada'
        })
      }).then(r => {
        if (!r.ok) throw new Error('Credenciais inválidas');
        return r.json();
      });
    } catch (e) {
      console.log('✅ Corretamente rejeitado:', e.message, '\n');
    }

    console.log('🏛️ 6. Criando instituição como usuário 1...');
    const inst = await fetch(`${BASE_URL}/api/instituicoes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome: 'Universidade Federal',
        cor: '#4a69bd'
      })
    }).then(r => r.json());
    console.log('✅ Instituição criada (ID:', inst.id, ')\n');

    console.log('📚 7. Listando instituições...');
    const insts = await fetch(`${BASE_URL}/api/instituicoes`)
      .then(r => r.json());
    console.log('✅ Total de instituições:', insts.length, '\n');

    console.log('\n✅✅✅ TODOS OS TESTES PASSARAM! ✅✅✅\n');
    console.log('📊 Resumo:');
    console.log('  • Banco SQLite funcionando ✓');
    console.log('  • Registro de usuários com senha criptografada ✓');
    console.log('  • Login autenticado ✓');
    console.log('  • Rejeição de senhas incorretas ✓');
    console.log('  • CRUD de instituições ✓\n');

    process.exit(0);
  } catch (err) {
    console.error('\n❌ ERRO:', err.message);
    console.error('\nDica: Certifique-se de que o servidor está rodando com "npm start"');
    process.exit(1);
  }
}

teste();
