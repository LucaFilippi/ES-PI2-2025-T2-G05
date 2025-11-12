// Autor: Implemented - alunos.js
// Gerencia alunos de uma disciplina (adicionar, editar, excluir, importar CSV, colunas extras)

let instituicoes = JSON.parse(localStorage.getItem('instituicoes')) || [];
let instituicaoIndex = parseInt(localStorage.getItem('instituicaoSelecionada'));
let disciplinaIndex = parseInt(localStorage.getItem('disciplinaSelecionada'));
let disciplina = null;
let turmaSelecionadaId = '';
let notasModoGeral = false;
let backupDisciplinaJSON = null;

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
  if (!Array.isArray(disciplina.turmas)) disciplina.turmas = [];
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

  // popular select de turmas
  const turmaSelect = document.getElementById('turmaSelect');
  turmaSelect.innerHTML = '<option value="">Selecione a Turma</option>';
  disciplina.turmas.forEach(t => {
    const opt = document.createElement('option'); opt.value = t.id; opt.innerText = t.nome; turmaSelect.appendChild(opt);
  });
  // manter seleção atual
  if (turmaSelecionadaId) turmaSelect.value = turmaSelecionadaId;

  const tbody = document.querySelector('#alunosTable tbody');
  tbody.innerHTML = '';

  // render header columns dynamically
  const theadRow = document.querySelector('#alunosTable thead tr');
  // reset to default 4 headers (Matrícula, Nome, Turma, Ações)
  theadRow.innerHTML = '';
  const thMat = document.createElement('th'); thMat.innerText = 'Matrícula'; theadRow.appendChild(thMat);
  const thNome = document.createElement('th'); thNome.innerText = 'Nome'; theadRow.appendChild(thNome);
  // if a turma foi selecionada, mostrar colunas das avaliações dessa turma
  let avaliacoes = [];
  if (turmaSelecionadaId) {
    const turma = disciplina.turmas.find(t=>t.id === turmaSelecionadaId);
    if (turma && Array.isArray(turma.avaliacoes)) avaliacoes = turma.avaliacoes;
  }
  avaliacoes.forEach(a => { const th = document.createElement('th'); th.innerText = a.nome; theadRow.appendChild(th); });
  const thFinal = document.createElement('th'); thFinal.innerText = 'Média Final'; theadRow.appendChild(thFinal);
  const thAcoes = document.createElement('th'); thAcoes.innerText = 'Ações'; theadRow.appendChild(thAcoes);

  // filtrar alunos da turma selecionada (se houver)
  const alunosFiltrados = turmaSelecionadaId ? disciplina.alunos.filter(a => (a.turma === turmaSelecionadaId || a.turma === (disciplina.turmas.find(t=>t.id===turmaSelecionadaId)||{}).nome)) : disciplina.alunos;

  alunosFiltrados.forEach((aluno, idx) => {
    const tr = document.createElement('tr');
    const tdMat = document.createElement('td'); tdMat.innerText = aluno.matricula || ''; tr.appendChild(tdMat);
  const tdNome = document.createElement('td'); tdNome.innerText = aluno.nome || ''; tr.appendChild(tdNome);
  // nota: coluna 'Turma' removida (uso de turmas por seleção)
      // avaliações (se houver)
      let somaFinal = 0;
      avaliacoes.forEach(av => {
        const td = document.createElement('td');
        aluno.notas = aluno.notas || {};
        const val = (aluno.notas.hasOwnProperty(av.id)) ? aluno.notas[av.id] : 0;
        if (notasModoGeral) {
          const input = document.createElement('input');
          input.type = 'number'; input.step = '0.01'; input.min = '0'; input.max = '100';
          input.value = val;
          input.style.width = '80px';
          input.addEventListener('change', (e) => {
            const n = parseFloat(e.target.value);
            aluno.notas[av.id] = isNaN(n) ? 0 : n;
          });
          td.appendChild(input);
        } else {
          const span = document.createElement('span'); span.innerText = val;
          span.style.cursor = 'pointer'; span.title = 'Clique para editar nota';
          span.addEventListener('click', (e) => {
            e.stopPropagation();
            const novo = prompt(`Nota para ${av.nome} do aluno ${aluno.nome}:`, String(val));
            if (novo === null) return;
            const n = parseFloat(novo.replace(',', '.'));
            aluno.notas = aluno.notas || {};
            aluno.notas[av.id] = isNaN(n) ? 0 : n;
            // save
            instituicoes[instituicaoIndex].disciplinas[disciplinaIndex] = disciplina;
            saveAll();
            renderAlunos();
            if (window.addLog) window.addLog(`lançou nota ${aluno.notas[av.id]} para ${av.nome} do aluno ${aluno.nome}`);
          });
          td.appendChild(span);
        }
        tr.appendChild(td);
        somaFinal += (Number(av.percentual||0) * Number(aluno.notas[av.id] || 0)) / 100;
      });

    const tdFinal = document.createElement('td'); tdFinal.innerText = (avaliacoes.length>0) ? somaFinal.toFixed(2) : ''; tr.appendChild(tdFinal);

  const tdAcoes = document.createElement('td');
  // compute real index in disciplina.alunos (because we may be rendering a filtered list)
  const realIdx = disciplina.alunos.indexOf(aluno);
  // Launch/Edit grades button
  const btnNotas = document.createElement('button'); btnNotas.innerText = 'Lançar/Editar notas';
  btnNotas.style.marginRight = '6px';
  btnNotas.onclick = (e) => { e.stopPropagation(); lancarNotas(realIdx); };
  tdAcoes.appendChild(btnNotas);
  // Edit student button
  const btnEdit = document.createElement('button'); btnEdit.innerText = 'Editar';
  btnEdit.style.marginRight = '6px';
  btnEdit.onclick = (e) => { e.stopPropagation(); editarAluno(realIdx); };
  tdAcoes.appendChild(btnEdit);
  // Delete button
  const btnDel = document.createElement('button'); btnDel.innerText = 'Excluir';
  btnDel.style.background = '#c0392b'; btnDel.style.color = 'white'; btnDel.onclick = (e) => { e.stopPropagation(); excluirAluno(realIdx); };
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
  const aluno = { matricula, nome, turma, extras: {}, notas: {} };
  // initialize notas for existing avaliacoes in that turma
  const turmaObj = disciplina.turmas.find(t=>t.id === turma || t.nome === turma);
  if (turmaObj && Array.isArray(turmaObj.avaliacoes)) {
    turmaObj.avaliacoes.forEach(av => { aluno.notas[av.id] = 0; });
  }
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

// abre prompts para lançar/editar todas as notas do aluno para a turma selecionada
function lancarNotas(idx) {
  if (!ensureDisciplineStructure()) return;
  const aluno = disciplina.alunos[idx];
  if (!aluno) return;
  if (!turmaSelecionadaId) return alert('Selecione uma turma antes de lançar notas.');
  const turma = disciplina.turmas.find(t=>t.id === turmaSelecionadaId);
  if (!turma || !Array.isArray(turma.avaliacoes) || turma.avaliacoes.length === 0) return alert('Esta turma não possui avaliações definidas.');
  aluno.notas = aluno.notas || {};
  turma.avaliacoes.forEach(av => {
    const atual = aluno.notas.hasOwnProperty(av.id) ? aluno.notas[av.id] : 0;
    const novo = prompt(`Nota para ${av.nome} do aluno ${aluno.nome}:`, String(atual));
    if (novo === null) return; // se cancelar uma das prompts, aborta restante
    const n = parseFloat(novo.replace(',', '.'));
    aluno.notas[av.id] = isNaN(n) ? 0 : n;
  });
  instituicoes[instituicaoIndex].disciplinas[disciplinaIndex] = disciplina;
  saveAll();
  renderAlunos();
  if (window.addLog) window.addLog(`lançou/alterou notas do aluno ${aluno.nome} na disciplina ${disciplina.nome}`);
}

// Modo de edição geral: habilita inputs na planilha para editar todas as notas
function entrarModoNotasGerais() {
  if (!ensureDisciplineStructure()) return;
  if (!turmaSelecionadaId) return alert('Selecione uma turma antes de editar as notas (modo geral).');
  const turma = disciplina.turmas.find(t=>t.id===turmaSelecionadaId);
  if (!turma || !Array.isArray(turma.avaliacoes) || turma.avaliacoes.length===0) return alert('Esta turma não possui avaliações definidas.');
  backupDisciplinaJSON = JSON.stringify(disciplina);
  notasModoGeral = true;
  // mostrar/ocultar botões via DOM
  const tBtn = document.getElementById('toggleNotasGeraisBtn');
  const sBtn = document.getElementById('saveNotasBtn');
  const cBtn = document.getElementById('cancelNotasBtn');
  if (tBtn && sBtn && cBtn) { tBtn.style.display='none'; sBtn.style.display='inline-block'; cBtn.style.display='inline-block'; }
  renderAlunos();
}

function salvarNotasGerais() {
  if (!ensureDisciplineStructure()) return;
  // persistir alterações já estão no objeto disciplina
  instituicoes[instituicaoIndex].disciplinas[disciplinaIndex] = disciplina;
  saveAll();
  notasModoGeral = false;
  backupDisciplinaJSON = null;
  const tBtn = document.getElementById('toggleNotasGeraisBtn');
  const sBtn = document.getElementById('saveNotasBtn');
  const cBtn = document.getElementById('cancelNotasBtn');
  if (tBtn && sBtn && cBtn) { tBtn.style.display='inline-block'; sBtn.style.display='none'; cBtn.style.display='none'; }
  renderAlunos();
  if (window.addLog) window.addLog('salvou notas no modo geral');
}

function cancelarNotasGerais() {
  if (!backupDisciplinaJSON) { notasModoGeral = false; renderAlunos(); return; }
  disciplina = JSON.parse(backupDisciplinaJSON);
  instituicoes[instituicaoIndex].disciplinas[disciplinaIndex] = disciplina;
  backupDisciplinaJSON = null;
  notasModoGeral = false;
  const tBtn = document.getElementById('toggleNotasGeraisBtn');
  const sBtn = document.getElementById('saveNotasBtn');
  const cBtn = document.getElementById('cancelNotasBtn');
  if (tBtn && sBtn && cBtn) { tBtn.style.display='inline-block'; sBtn.style.display='none'; cBtn.style.display='none'; }
  renderAlunos();
}

function adicionarColuna() {
  if (!ensureDisciplineStructure()) return;
  const coluna = prompt('Nome da nova coluna (legado):');
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
  // se uma turma foi escolhida na página de Turmas, pré-selecionar aqui
  turmaSelecionadaId = localStorage.getItem('turmaSelecionada') || '';
  if (turmaSelecionadaId) {
    // limpar após leitura para não afetar navegações futuras
    localStorage.removeItem('turmaSelecionada');
  }
  document.getElementById('addAlunoBtn').addEventListener('click', adicionarAluno);
  document.getElementById('addColunaBtn').addEventListener('click', adicionarColuna);
  document.getElementById('importarBtn').addEventListener('click', () => {
    const f = document.getElementById('csvFile').files[0];
    if (!f) return alert('Selecione um arquivo CSV.');
    importarCSVFile(f);
  });
  document.getElementById('turmaSelect').addEventListener('change', (e)=>{
    turmaSelecionadaId = e.target.value;
    renderAlunos();
  });
  // global notes edit buttons
  const tBtn = document.getElementById('toggleNotasGeraisBtn');
  const sBtn = document.getElementById('saveNotasBtn');
  const cBtn = document.getElementById('cancelNotasBtn');
  if (tBtn) tBtn.addEventListener('click', entrarModoNotasGerais);
  if (sBtn) sBtn.addEventListener('click', salvarNotasGerais);
  if (cBtn) cBtn.addEventListener('click', cancelarNotasGerais);
  // initial render
  renderAlunos();
});
