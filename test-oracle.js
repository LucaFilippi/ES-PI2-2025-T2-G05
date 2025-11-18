console.log('>>> script iniciado');

try {
  console.log('>>> antes require');
  const oracledb = require('oracledb');
  console.log('>>> depois require');
} catch (e) {
  console.error('Erro sync require:', e);
}

console.log('>>> agora testando conexão (async)');

(async function run() {
  try {
    console.log('Tentando conectar...');
    const oracledb = require('oracledb');
    const conn = await oracledb.getConnection({
      user: 'system',            
      password: 'breno2517',
      connectString: 'localhost:1521/XE'
    });
    console.log('Conectado com sucesso!');
    const result = await conn.execute(`SELECT 'OK' AS teste FROM dual`);
    console.log('Resultado:', result.rows);
    await conn.close();
    console.log('Conexão fechada. Fim.');
  } catch (err) {
    console.error('Erro dentro do try (async):', err);
  }
})();

