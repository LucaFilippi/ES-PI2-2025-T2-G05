const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_FILE = path.join(__dirname, 'notadez.db');
const SCHEMA_FILE = path.join(__dirname, 'schema.sql');

function openDb() {
  const exists = fs.existsSync(DB_FILE);
  const db = new sqlite3.Database(DB_FILE);
  if (!exists) {
    // seed schema
    const schema = fs.readFileSync(SCHEMA_FILE, 'utf8');
    db.exec(schema, (err) => {
      if (err) console.error('Erro ao criar schema:', err);
      else console.log('Banco criado e schema aplicado.');
    });
  }
  return db;
}

module.exports = { openDb };
