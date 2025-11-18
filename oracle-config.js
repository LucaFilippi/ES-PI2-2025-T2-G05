// ==========================================
// CONFIGURAÇÃO DO ORACLE DATABASE
// ==========================================
// 
// Preencha com seus dados do Oracle:

const oracleConfig = {
  user: 'system',        // Seu usuário Oracle (ex: system, scott)
  password: 'breno2517',      // Sua senha Oracle
  connectString: 'localhost:1521/XE'  // Formato: host:porta/SERVICE_NAME
  // Exemplos de connectString:
  // 'localhost:1521/XE'          - Oracle XE local
  // 'localhost:1521/ORCL'        - Oracle Database local
  // '192.168.1.100:1521/ORCL'    - Oracle remoto
};

module.exports = oracleConfig;
