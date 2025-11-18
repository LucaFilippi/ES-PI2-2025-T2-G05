const { openDb } = require('./db');

function runMoreTests() {
  const db = openDb();
  db.serialize(() => {
    // 1) Inserir instituição
    db.run('INSERT INTO instituicoes (nome, cor) VALUES (?, ?)', ['Teste Full', '#112233'], function(err) {
      if (err) return finish(err);
      const instId = this.lastID;
      console.log('instituicao.id =', instId);

      // 2) Inserir disciplina ligada à instituicao
      db.run('INSERT INTO disciplinas (instituicao_id, nome, codigo, cor) VALUES (?, ?, ?, ?)', [instId, 'Disc Teste', 'DT1', '#445566'], function(err) {
        if (err) return finish(err);
        const discId = this.lastID;
        console.log('disciplina.id =', discId);

        // 3) Inserir turma (id texto)
        const turmaId = 'turma_test_full';
        db.run('INSERT OR REPLACE INTO turmas (id, disciplina_id, nome) VALUES (?, ?, ?)', [turmaId, discId, 'Turma Teste'], function(err) {
          if (err) return finish(err);
          console.log('turma.id =', turmaId);

          // 4) Inserir avaliacao
          const avId = 'av_test_full';
          db.run('INSERT OR REPLACE INTO avaliacoes (id, turma_id, nome, percentual) VALUES (?, ?, ?, ?)', [avId, turmaId, 'Aval Teste', 10], function(err) {
            if (err) return finish(err);
            console.log('avaliacao.id =', avId);

            // 5) Inserir aluno vinculado à turma
            db.run('INSERT INTO alunos (matricula, nome, turma_id) VALUES (?, ?, ?)', ['M123', 'Aluno Teste', turmaId], function(err) {
              if (err) return finish(err);
              const alunoId = this.lastID;
              console.log('aluno.id =', alunoId);

              // 6) Inserir nota
              db.run('INSERT INTO notas (aluno_id, avaliacao_id, valor) VALUES (?, ?, ?)', [alunoId, avId, 8.5], function(err) {
                if (err) return finish(err);
                const notaId = this.lastID;
                console.log('nota.id =', notaId);

                // 7) Verificar contagens
                db.get('SELECT COUNT(*) as c FROM disciplinas WHERE instituicao_id = ?', [instId], (err, row) => {
                  if (err) return finish(err);
                  console.log('disciplinas for instituicao:', row.c);

                  db.get('SELECT COUNT(*) as c FROM turmas WHERE disciplina_id = ?', [discId], (err, row2) => {
                    if (err) return finish(err);
                    console.log('turmas for disciplina:', row2.c);

                    db.get('SELECT COUNT(*) as c FROM avaliacoes WHERE turma_id = ?', [turmaId], (err, row3) => {
                      if (err) return finish(err);
                      console.log('avaliacoes for turma:', row3.c);

                      db.get('SELECT COUNT(*) as c FROM notas WHERE aluno_id = ?', [alunoId], (err, row4) => {
                        if (err) return finish(err);
                        console.log('notas for aluno:', row4.c);

                        // 8) Deletar instituicao e verificar cascatas/SET NULL
                        db.run('DELETE FROM instituicoes WHERE id = ?', [instId], function(err) {
                          if (err) return finish(err);
                          console.log('deleted instituicao', instId);

                          // Verificar disciplina removida
                          db.get('SELECT COUNT(*) as c FROM disciplinas WHERE id = ?', [discId], (err, afterDisc) => {
                            if (err) return finish(err);
                            console.log('disciplina exists after delete (should be 0):', afterDisc.c);

                            // turma should also be removed due to cascade from disciplina
                            db.get('SELECT COUNT(*) as c FROM turmas WHERE id = ?', [turmaId], (err, afterTurma) => {
                              if (err) return finish(err);
                              console.log('turma exists after delete (expected 0):', afterTurma.c);

                              // avaliacoes should be removed as well
                              db.get('SELECT COUNT(*) as c FROM avaliacoes WHERE id = ?', [avId], (err, afterAv) => {
                                if (err) return finish(err);
                                console.log('avaliacao exists after delete (expected 0):', afterAv.c);

                                // alunos: turma_id should be SET NULL
                                db.get('SELECT turma_id FROM alunos WHERE id = ?', [alunoId], (err, alunoRow) => {
                                  if (err) return finish(err);
                                  console.log('aluno.turma_id after delete (expected null):', alunoRow ? alunoRow.turma_id : null);

                                  // notas referencing removed avaliacao may persist or be removed depending on cascade; check
                                  db.get('SELECT COUNT(*) as c FROM notas WHERE id = ?', [notaId], (err, afterNota) => {
                                    if (err) return finish(err);
                                    console.log('nota exists after delete (may be 0 if cascaded):', afterNota.c);
                                    finish();
                                  });
                                });
                              });
                            });
                          });
                        });
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
    });
  });

  function finish(err) {
    if (err) {
      console.error('Erro durante testes:', err);
      try { db.close(); } catch (e) {}
      process.exit(1);
    } else {
      console.log('Todos testes completos.');
      try { db.close(); } catch (e) {}
      process.exit(0);
    }
  }
}

runMoreTests();
