const oracledb = require('oracledb');

// Read connection info from env vars
// Accept both ORACLE_* and DB_* environment variable names for compatibility
const DB_CONFIG = {
  user: process.env.DB_USER || process.env.ORACLE_USER || 'system',
  password: process.env.DB_PASS || process.env.ORACLE_PASSWORD || 'notadez',
  connectString: process.env.DB_CONNECT_STRING || `${process.env.ORACLE_HOST || 'localhost'}:${process.env.ORACLE_PORT || 1521}/${process.env.ORACLE_SID || 'XE'}`
};

let pool;

async function initPool() {
  if (pool) return pool;
  try {
    pool = await oracledb.createPool({
      user: DB_CONFIG.user,
      password: DB_CONFIG.password,
      connectString: DB_CONFIG.connectString,
      poolMin: 0,
      poolMax: 10,
      poolIncrement: 1
    });
    console.log('Oracle pool created');
    return pool;
  } catch (err) {
    console.error('Error creating Oracle pool:', err);
    throw err;
  }
}

async function getConnection() {
  const p = await initPool();
  return await p.getConnection();
}

// Helper: run a simple query and return all rows
async function all(sql, params=[]) {
  const conn = await getConnection();
  try {
    const result = await conn.execute(sql, params, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    return result.rows;
  } finally {
    try { await conn.close(); } catch(e){}
  }
}

// Helper: run a statement (INSERT/UPDATE/DELETE)
async function run(sql, params=[]) {
  const conn = await getConnection();
  try {
    const result = await conn.execute(sql, params, { autoCommit: true });
    return result;
  } finally {
    try { await conn.close(); } catch(e){}
  }
}

// Execute an INSERT and return generated id using RETURNING id INTO :outId
async function executeReturning(sql, params=[]) {
  const conn = await getConnection();
  try {
    // convert '?' placeholders to named binds :b1, :b2, ...
    let idx = 0;
    const binds = {};
    const sqlNamed = sql.replace(/\?/g, () => {
      idx += 1;
      const name = `:b${idx}`;
      return name;
    });
    // build binds object
    for (let i = 0; i < params.length; i++) {
      binds[`b${i+1}`] = params[i];
    }
    // add out bind
    binds.outId = { dir: oracledb.BIND_OUT, type: oracledb.NUMBER };

    // append RETURNING clause
    const sqlFinal = `${sqlNamed} RETURNING id INTO :outId`;
    const result = await conn.execute(sqlFinal, binds, { autoCommit: true });
    return { lastID: result.outBinds && result.outBinds.outId ? result.outBinds.outId[0] || result.outBinds.outId : null, result };
  } finally {
    try { await conn.close(); } catch(e){}
  }
}

module.exports = { initPool, getConnection, all, run, executeReturning };
