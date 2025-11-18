const oracle = require('./db_oracle');

(async () => {
  try {
    await oracle.initPool();
    const users = await oracle.all('SELECT id, nome, email, created_at FROM users ORDER BY id DESC FETCH FIRST 10 ROWS ONLY');
    console.log('Últimos usuários:');
    console.table(users);

    const logs = await oracle.all('SELECT id, timestamp, "user", SUBSTR(message,1,200) as message FROM logs ORDER BY timestamp DESC FETCH FIRST 10 ROWS ONLY');
    console.log('Últimos logs:');
    console.table(logs);

    const resets = await oracle.all('SELECT id, user_id, token, expires_at FROM password_resets ORDER BY id DESC FETCH FIRST 10 ROWS ONLY');
    console.log('Password resets:');
    console.table(resets);

    process.exit(0);
  } catch (e) {
    console.error('Erro ao conectar/consultar Oracle:', e);
    process.exit(1);
  }
})();
