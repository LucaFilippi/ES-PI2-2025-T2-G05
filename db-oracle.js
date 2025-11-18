const oracledb = require('oracledb');
const oracleConfig = require('./oracle-config');

let pool = null;

async function initializePool() {
  try {
    pool = await oracledb.createPool({
      user: oracleConfig.user,
      password: oracleConfig.password,
      connectString: oracleConfig.connectString,
      poolAlias: 'default'
    });
    console.log('✅ Pool de conexão Oracle criado com sucesso');
  } catch (err) {
    console.error('❌ Erro ao criar pool de conexão:', err.message);
    process.exit(1);
  }
}

async function getConnection() {
  if (!pool) {
    await initializePool();
  }
  try {
    const connection = await oracledb.getConnection('default');
    return connection;
  } catch (err) {
    console.error('❌ Erro ao obter conexão:', err.message);
    throw err;
  }
}

async function query(sql, binds = []) {
  const connection = await getConnection();
  try {
    const result = await connection.execute(sql, binds, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    return result.rows || [];
  } catch (err) {
    console.error('❌ Erro na query:', err.message);
    throw err;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Erro ao fechar conexão:', err.message);
      }
    }
  }
}

async function execute(sql, binds = []) {
  const connection = await getConnection();
  try {
    const result = await connection.execute(sql, binds, { autoCommit: true });
    return result;
  } catch (err) {
    console.error('❌ Erro na execução:', err.message);
    throw err;
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Erro ao fechar conexão:', err.message);
      }
    }
  }
}

async function createTables() {
  try {
    // Criar tabela USERS
    await execute(`
      CREATE TABLE USERS (
        ID NUMBER PRIMARY KEY,
        NOME VARCHAR2(100) NOT NULL,
        EMAIL VARCHAR2(100) UNIQUE NOT NULL,
        TELEFONE VARCHAR2(20),
        SENHA_HASH VARCHAR2(255) NOT NULL,
        CREATED_AT TIMESTAMP DEFAULT SYSDATE
      )
    `);
    console.log('✅ Tabela USERS criada');
  } catch (err) {
    if (err.message.includes('already exists')) {
      console.log('ℹ️  Tabela USERS já existe');
    } else {
      console.error('Erro ao criar USERS:', err.message);
    }
  }

  try {
    // Criar sequência para USERS
    await execute(`CREATE SEQUENCE USERS_SEQ START WITH 1 INCREMENT BY 1`);
    console.log('✅ Sequência USERS_SEQ criada');
  } catch (err) {
    if (err.message.includes('already exists')) {
      console.log('ℹ️  Sequência USERS_SEQ já existe');
    } else {
      console.error('Erro ao criar sequência:', err.message);
    }
  }

  try {
    // Criar trigger para auto-increment
    await execute(`
      CREATE OR REPLACE TRIGGER USERS_INSERT_TRIGGER
      BEFORE INSERT ON USERS
      FOR EACH ROW
      BEGIN
        IF :NEW.ID IS NULL THEN
          SELECT USERS_SEQ.NEXTVAL INTO :NEW.ID FROM DUAL;
        END IF;
      END;
      /
    `);
    console.log('✅ Trigger USERS_INSERT_TRIGGER criado');
  } catch (err) {
    if (err.message.includes('already exists')) {
      console.log('ℹ️  Trigger já existe');
    } else {
      console.error('Erro ao criar trigger:', err.message);
    }
  }

  try {
    // Criar tabela INSTITUICOES
    await execute(`
      CREATE TABLE INSTITUICOES (
        ID NUMBER PRIMARY KEY,
        USER_ID NUMBER NOT NULL REFERENCES USERS(ID) ON DELETE CASCADE,
        NOME VARCHAR2(100) NOT NULL,
        COR VARCHAR2(20),
        CREATED_AT TIMESTAMP DEFAULT SYSDATE
      )
    `);
    console.log('✅ Tabela INSTITUICOES criada');
  } catch (err) {
    if (err.message.includes('already exists')) {
      console.log('ℹ️  Tabela INSTITUICOES já existe');
    } else {
      console.error('Erro ao criar INSTITUICOES:', err.message);
    }
  }

  try {
    // Criar sequência para INSTITUICOES
    await execute(`CREATE SEQUENCE INSTITUICOES_SEQ START WITH 1 INCREMENT BY 1`);
    console.log('✅ Sequência INSTITUICOES_SEQ criada');
  } catch (err) {
    if (err.message.includes('already exists')) {
      console.log('ℹ️  Sequência já existe');
    }
  }

  try {
    // Criar trigger para INSTITUICOES
    await execute(`
      CREATE OR REPLACE TRIGGER INSTITUICOES_INSERT_TRIGGER
      BEFORE INSERT ON INSTITUICOES
      FOR EACH ROW
      BEGIN
        IF :NEW.ID IS NULL THEN
          SELECT INSTITUICOES_SEQ.NEXTVAL INTO :NEW.ID FROM DUAL;
        END IF;
      END;
      /
    `);
    console.log('✅ Trigger INSTITUICOES criado');
  } catch (err) {
    if (err.message.includes('already exists')) {
      console.log('ℹ️  Trigger já existe');
    }
  }
}

async function closePool() {
  if (pool) {
    try {
      await pool.close();
      console.log('Pool de conexão fechado');
    } catch (err) {
      console.error('Erro ao fechar pool:', err.message);
    }
  }
}

module.exports = {
  initializePool,
  getConnection,
  query,
  execute,
  createTables,
  closePool
};
