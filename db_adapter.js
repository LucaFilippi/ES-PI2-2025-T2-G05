const DB_TYPE = (process.env.DB_TYPE || 'sqlite').toLowerCase();

if (DB_TYPE === 'oracle') {
  const oracle = require('./db_oracle');

  // map to callback-style used by existing server.js
  module.exports = {
    all: (sql, params, cb) => {
      if (typeof params === 'function') { cb = params; params = []; }
      oracle.all(convertPlaceholders(sql), params).then(rows => cb(null, rows)).catch(err => cb(err));
    },
    get: (sql, params, cb) => {
      if (typeof params === 'function') { cb = params; params = []; }
      oracle.all(convertPlaceholders(sql), params).then(rows => cb(null, rows && rows.length ? rows[0] : undefined)).catch(err => cb(err));
    },
    run: (sql, params, cb) => {
      if (typeof params === 'function') { cb = params; params = []; }
      const trimmed = sql.trim().toUpperCase();
      if (trimmed.startsWith('INSERT')) {
        oracle.executeReturning(convertPlaceholders(sql), params).then(r => {
          if (cb) cb.call({ lastID: r.lastID }, null);
        }).catch(err => cb && cb(err));
      } else {
        oracle.run(convertPlaceholders(sql), params).then(r => cb && cb(null, r)).catch(err => cb && cb(err));
      }
    },
    exec: (sql, cb) => {
      // exec not commonly used for Oracle in this app; run statements one by one
      const statements = sql.split(/;\s*\n/).map(s => s.trim()).filter(Boolean);
      Promise.all(statements.map(s => oracle.run(s))).then(() => cb && cb(null)).catch(err => cb && cb(err));
    },
    prepare: (sql) => {
      const statements = [];
      return {
        run: function(params) { statements.push(params || []); },
        finalize: function(cb) {
          // execute sequentially
          (async () => {
            try {
              for (let p of statements) {
                await oracle.run(convertPlaceholders(sql), p);
              }
              if (cb) cb(null);
            } catch (e) {
              if (cb) cb(e);
            }
          })();
        }
      };
    }
  };

  function convertPlaceholders(sql) {
    // replace ? with named binds :b1, :b2 ... for oracle.executeReturning we also append RETURNING
    let idx = 0;
    return sql.replace(/\?/g, () => { idx += 1; return `:b${idx}`; });
  }

} else {
  // sqlite
  const { openDb } = require('./db');
  const sqlite = openDb();
  module.exports = sqlite;
}
