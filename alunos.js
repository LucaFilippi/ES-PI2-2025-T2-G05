// Autor: Implemented - alunos.js
// Gerencia alunos de uma disciplina (adicionar, editar, excluir, importar CSV, colunas extras)

let instituicoes = JSON.parse(localStorage.getItem('instituicoes')) || [];
let instituicaoIndex = parseInt(localStorage.getItem('instituicaoSelecionada'));
let disciplinaIndex = parseInt(localStorage.getItem('disciplinaSelecionada'));
let disciplina = null;

function saveAll() {
  localStorage.setItem('instituicoes', JSON.stringify(instituicoes));
}

function ensureDisciplineStructure() {
  if (!instituicoes || typeof instituicaoIndex !== 'number' || isNaN(instituicaoIndex)) return false;
  const inst = instituicoes[instituicaoIndex];
  if (!inst) return false;
  if (typeof disciplinaIndex !== 'number' || isNaN(disciplinaIndex)) return false;
  if (!Array.isArray(inst.disciplinas) || !inst.disciplinas[disciplinaIndex]) return false;
  disciplina = inst.disciplinas[disciplinaIndex];
  // ensure columns array
  if (!Array.isArray(disciplina.colunas)) disciplina.colunas = [];
  // ensure alunos array
  if (!Array.isArray(disciplina.alunos)) disciplina.alunos = [];
  return true;
}

function renderAlunos() {
  const title = document.querySelector('.container h2');
  if (!ensureDisciplineStructure()) {
    title && (title.innerText = 'Disciplina não encontrada');
    return;
  }
  title && (title.innerText = `Alunos — ${disciplina.nome}`);

  const tbody = document.querySelector('#alunosTable tbody');
  tbody.innerHTML = '';

  // render header columns dynamically
  const theadRow = document.querySelector('#alunosTable thead tr');
  // reset to default 4 headers (Matrícula, Nome, Turma, Ações)
  theadRow.innerHTML = '';
  const thMat = document.createElement('th'); thMat.innerText = 'Matrícula'; theadRow.appendChild(thMat);
  const thNome = document.createElement('th'); thNome.innerText = 'Nome'; theadRow.appendChild(thNome);
  const thTurma = document.createElement('th'); thTurma.innerText = 'Turma'; theadRow.appendChild(thTurma);
  // extra columns
  disciplina.colunas.forEach(c => {
    const th = document.createElement('th'); th.innerText = c; theadRow.appendChild(th);
  });
  const thAcoes = document.createElement('th'); thAcoes.innerText = 'Ações'; theadRow.appendChild(thAcoes);

  disciplina.alunos.forEach((aluno, idx) => {
    const tr = document.createElement('tr');
    const tdMat = document.createElement('td'); tdMat.innerText = aluno.matricula || ''; tr.appendChild(tdMat);
    const tdNome = document.createElement('td'); tdNome.innerText = aluno.nome || ''; tr.appendChild(tdNome);
    const tdTurma = document.createElement('td'); tdTurma.innerText = aluno.turma || ''; tr.appendChild(tdTurma);
    // extra columns values
    disciplina.colunas.forEach(col => {
      const td = document.createElement('td');
      const val = (aluno.extras && aluno.extras[col]) ? aluno.extras[col] : '';
      // make editable inline
      const span = document.createElement('span'); span.innerText = val;
      span.style.cursor = 'pointer';
      span.title = 'Clique para editar';
      span.addEventListener('click', (e) => {
        e.stopPropagation();
        const novo = prompt(`Valor para ${col} do aluno ${aluno.nome}:`, val || '');
        if (novo === null) return;
        aluno.extras = aluno.extras || {};
        const old = aluno.extras[col] || '';
        aluno.extras[col] = novo;
        saveAll();
        renderAlunos();
        if (window.addLog) window.addLog(`alterou a coluna ${col} do aluno ${aluno.nome} (${aluno.matricula}) de "${old}" para "${novo}"`);
      });
      td.appendChild(span);
      tr.appendChild(td);
    });

    const tdAcoes = document.createElement('td');
    // Edit button
    const btnEdit = document.createElement('button'); btnEdit.innerText = 'Editar';
    btnEdit.style.marginRight = '6px';
    btnEdit.onclick = (e) => { e.stopPropagation(); editarAluno(idx); };
    tdAcoes.appendChild(btnEdit);
    // Delete button
    const btnDel = document.createElement('button'); btnDel.innerText = 'Excluir';
    btnDel.style.background = '#c0392b'; btnDel.style.color = 'white'; btnDel.onclick = (e) => { e.stopPropagation(); excluirAluno(idx); };
    tdAcoes.appendChild(btnDel);

    tr.appendChild(tdAcoes);
    tbody.appendChild(tr);
  });
}

function adicionarAluno() {
  if (!ensureDisciplineStructure()) return;
  const matricula = document.getElementById('matricula').value.trim();
  const nome = document.getElementById('nome').value.trim();
  const turma = document.getElementById('turmaSelect').value;
  if (!matricula || !nome) {
    document.getElementById('msg').innerText = 'Matrícula e nome são obrigatórios.';
    document.getElementById('msg').style.color = 'red';
    return;
  }
  const aluno = { matricula, nome, turma, extras: {} };
  // initialize extras keys
  disciplina.colunas.forEach(c => { aluno.extras[c] = ''; });
  disciplina.alunos.push(aluno);
  instituicoes[instituicaoIndex].disciplinas[disciplinaIndex] = disciplina;
  saveAll();
  renderAlunos();
  document.getElementById('matricula').value = '';
  document.getElementById('nome').value = '';
  document.getElementById('msg').innerText = 'Aluno adicionado.'; document.getElementById('msg').style.color = 'green';
  if (window.addLog) window.addLog(`adicionou o aluno ${nome} (${matricula}) na disciplina ${disciplina.nome}`);
}

function editarAluno(idx) {
  if (!ensureDisciplineStructure()) return;
  const aluno = disciplina.alunos[idx];
  const novoNome = prompt('Nome do aluno:', aluno.nome);
  if (novoNome === null) return;
  const novaMat = prompt('Matrícula:', aluno.matricula);
  if (novaMat === null) return;
  const novaTurma = prompt('Turma:', aluno.turma || '');
  if (novaTurma === null) return;
  const old = { nome: aluno.nome, matricula: aluno.matricula, turma: aluno.turma };
  aluno.nome = novoNome.trim() || aluno.nome;
  aluno.matricula = novaMat.trim() || aluno.matricula;
  aluno.turma = novaTurma.trim() || aluno.turma;
  instituicoes[instituicaoIndex].disciplinas[disciplinaIndex] = disciplina;
  saveAll();
  renderAlunos();
  if (window.addLog) window.addLog(`alterou o aluno ${old.nome} (${old.matricula}) para ${aluno.nome} (${aluno.matricula}) na disciplina ${disciplina.nome}`);
}

function excluirAluno(idx) {
  if (!ensureDisciplineStructure()) return;
  const aluno = disciplina.alunos[idx];
  if (!confirm(`Confirma exclusão do aluno ${aluno.nome} (${aluno.matricula})?`)) return;
  disciplina.alunos.splice(idx, 1);
  instituicoes[instituicaoIndex].disciplinas[disciplinaIndex] = disciplina;
  saveAll();
  renderAlunos();
  if (window.addLog) window.addLog(`deletou o aluno ${aluno.nome} (${aluno.matricula}) da disciplina ${disciplina.nome}`);
}

function adicionarColuna() {
  if (!ensureDisciplineStructure()) return;
  const coluna = prompt('Nome da nova coluna (ex: Prova1, Trabalho):');
  if (!coluna) return;
  if (disciplina.colunas.includes(coluna)) { alert('Coluna já existe.'); return; }
  disciplina.colunas.push(coluna);
  // add empty values to existing alunos
  disciplina.alunos.forEach(a => { a.extras = a.extras || {}; a.extras[coluna] = ''; });
  instituicoes[instituicaoIndex].disciplinas[disciplinaIndex] = disciplina;
  saveAll();
  renderAlunos();
  if (window.addLog) window.addLog(`adicionou a coluna ${coluna} na disciplina ${disciplina.nome}`);
}

function importarCSVFile(file) {
  const reader = new FileReader();
  reader.onload = function(e) {
    const text = e.target.result;
    importarCSV(text);
  };
  reader.readAsText(file, 'UTF-8');
}

function importarCSV(text) {
  if (!ensureDisciplineStructure()) return;
  // simple CSV parser: first line headers, comma separated
  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length>0);
  if (lines.length === 0) return alert('CSV vazio');
  const headers = lines[0].split(',').map(h=>h.trim());
  const idxMat = headers.findIndex(h => /matricul/i.test(h));
  const idxNome = headers.findIndex(h => /nome/i.test(h));
  const idxTurma = headers.findIndex(h => /turm/i.test(h));
  // treat other headers as extras; ensure discipline has these columns
  const extrasHeaders = headers.filter((h,i)=> i!==idxMat && i!==idxNome && i!==idxTurma);
  extrasHeaders.forEach(h => { if (!disciplina.colunas.includes(h)) disciplina.colunas.push(h); });

  for (let i=1;i<lines.length;i++){
    const row = lines[i].split(',').map(c=>c.trim());
    const matricula = (idxMat>=0)? row[idxMat] || '' : '';
    const nome = (idxNome>=0)? row[idxNome] || '' : (row[0]||'');
    const turma = (idxTurma>=0)? row[idxTurma] || '' : '';
    const aluno = { matricula, nome, turma, extras: {} };
    disciplina.colunas.forEach(col => { aluno.extras[col] = ''; });
    // fill extras from row
    extrasHeaders.forEach(h => {
      const j = headers.indexOf(h);
      aluno.extras[h] = row[j] || '';
    });
    disciplina.alunos.push(aluno);
    if (window.addLog) window.addLog(`importou aluno ${nome} (${matricula}) via CSV para a disciplina ${disciplina.nome}`);
  }
  instituicoes[instituicaoIndex].disciplinas[disciplinaIndex] = disciplina;
  saveAll();
  renderAlunos();
  document.getElementById('msg').innerText = 'CSV importado.'; document.getElementById('msg').style.color='green';
}

// wire UI
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('addAlunoBtn').addEventListener('click', adicionarAluno);
  document.getElementById('addColunaBtn').addEventListener('click', adicionarColuna);
  document.getElementById('importarBtn').addEventListener('click', () => {
    const f = document.getElementById('csvFile').files[0];
    if (!f) return alert('Selecione um arquivo CSV.');
    importarCSVFile(f);
  });
  // initial render
  renderAlunos();
});
