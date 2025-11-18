const { openDb } = require('./db');

function runTest() {
  const db = openDb();
  db.serialize(() => {
    // Inserir uma instituição de teste
    db.run('INSERT INTO instituicoes (nome, cor) VALUES (?, ?)', ['Teste DB', '#00FF00'], function(err) {
      if (err) {
        console.error('Erro ao inserir instituicao:', err);
        process.exit(1);
      }
      const insertedId = this.lastID;
      console.log('Inserido instituicao id =', insertedId);

      // Ler todas as instituicoes
      db.all('SELECT id, nome, cor FROM instituicoes WHERE id = ?', [insertedId], (err, rows) => {
        if (err) {
          console.error('Erro ao ler instituicoes:', err);
          process.exit(1);
        }
        console.log('Linhas lidas:', rows);

        // Limpeza: remover a instituição inserida
        db.run('DELETE FROM instituicoes WHERE id = ?', [insertedId], function(err) {
          if (err) {
            console.error('Erro ao remover instituicao:', err);
            process.exit(1);
          }
          console.log('Removida instituicao id =', insertedId);
          db.close();
          process.exit(0);
        });
      });
    });
  });
}

runTest();
