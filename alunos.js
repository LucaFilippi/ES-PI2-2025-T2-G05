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

  // exibir turma selecionada no topo
  let nomeTurma = '—';
  if (turmaSelecionadaId) {
    const turmaObj = disciplina.turmas.find(t => t.id === turmaSelecionadaId);
    if (turmaObj) nomeTurma = turmaObj.nome;
  }
  const turmaTituloEl = document.getElementById('turmaTitulo');
  if (turmaTituloEl) turmaTituloEl.innerText = `Turma selecionada: ${nomeTurma}`;

  // se nenhuma turma foi selecionada, avisar
  if (!turmaSelecionadaId) {
    document.querySelector('#alunosTable tbody').innerHTML = '';
    const msg = document.getElementById('msg');
    msg.innerText = 'Selecione uma turma na página anterior para visualizar alunos.';
    msg.style.color = 'orange';
    return;
  }

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
  const alunosFiltrados = turmaSelecionadaId ? disciplina.alunos.filter(a => a.turma === turmaSelecionadaId) : disciplina.alunos;

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
          input.type = 'number'; input.step = '0.01'; input.min = '0'; input.max = '10';
          input.value = val;
          input.style.width = '80px';
          input.addEventListener('change', (e) => {
            let n = parseFloat(e.target.value);
            // validar: entre 0 e 10, máx 2 casas decimais
            if (isNaN(n)) n = 0;
            if (n < 0) n = 0;
            if (n > 10) n = 10;
            // limitar a 2 casas decimais
            n = Math.round(n * 100) / 100;
            e.target.value = n;
            aluno.notas[av.id] = n;
          });
          input.addEventListener('blur', (e) => {
            let n = parseFloat(e.target.value);
            if (isNaN(n)) n = 0;
            if (n < 0) n = 0;
            if (n > 10) n = 10;
            n = Math.round(n * 100) / 100;
            e.target.value = n;
            aluno.notas[av.id] = n;
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
  if (!turmaSelecionadaId) return alert('Nenhuma turma selecionada. Volte e selecione uma turma.');
  const matricula = document.getElementById('matricula').value.trim();
  const nome = document.getElementById('nome').value.trim();
  if (!matricula || !nome) {
    document.getElementById('msg').innerText = 'Matrícula e nome são obrigatórios.';
    document.getElementById('msg').style.color = 'red';
    return;
  }
  const aluno = { matricula, nome, turma: turmaSelecionadaId, extras: {}, notas: {} };
  // initialize notas for existing avaliacoes in that turma
  const turmaObj = disciplina.turmas.find(t=>t.id === turmaSelecionadaId);
  if (turmaObj && Array.isArray(turmaObj.avaliacoes)) {
    turmaObj.avaliacoes.forEach(av => { aluno.notas[av.id] = 0; });
  }
  disciplina.alunos.push(aluno);
  // ordenar alfabeticamente por nome
  disciplina.alunos.sort((a, b) => {
    const nomeA = (a.nome || '').toLowerCase();
    const nomeB = (b.nome || '').toLowerCase();
    return nomeA.localeCompare(nomeB);
  });
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
  // reordenar alfabeticamente após edição
  disciplina.alunos.sort((a, b) => {
    const nomeA = (a.nome || '').toLowerCase();
    const nomeB = (b.nome || '').toLowerCase();
    return nomeA.localeCompare(nomeB);
  });
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
  if (!turmaSelecionadaId) {
    alert('Nenhuma turma selecionada. Volte para a página de turmas e selecione uma turma antes de importar.');
    return;
  }
  
  // Verificar se a turma selecionada realmente existe
  const turmaObj = disciplina.turmas.find(t => t.id === turmaSelecionadaId);
  if (!turmaObj) {
    alert('Turma selecionada não encontrada. Selecione uma turma válida.');
    return;
  }

  const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length === 0) return alert('CSV vazio');
  
  let importados = 0;
  let duplicatas = 0;
  let errors = 0;
  
  // Processar cada linha
  for (let i = 0; i < lines.length; i++) {
    const row = lines[i].split(',').map(c => c.trim());
    if (row.length < 2) {
      errors++;
      continue;
    }
    
    const matricula = row[0] || '';
    const nome = row[1] || '';
    
    // SEMPRE usar a turma selecionada, ignorar qualquer turma no CSV
    const turma = turmaSelecionadaId;
    
    if (!matricula || !nome) {
      errors++;
      continue;
    }
    
    // Verificar duplicata por matrícula (na disciplina inteira ou apenas na turma)
    const alunoDuplicado = disciplina.alunos.find(a => 
      a.matricula === matricula && a.turma === turmaSelecionadaId
    );
    
    if (alunoDuplicado) {
      duplicatas++;
      if (window.addLog) window.addLog(`evitou importar aluno com matrícula duplicada na mesma turma: ${matricula}`);
      continue;
    }
    
    const aluno = { 
      matricula, 
      nome, 
      turma: turmaSelecionadaId, // Usar APENAS o ID da turma selecionada
      extras: {}, 
      notas: {} 
    };
    
    // Inicializar notas para as avaliações da turma selecionada
    if (turmaObj && Array.isArray(turmaObj.avaliacoes)) {
      turmaObj.avaliacoes.forEach(av => { 
        aluno.notas[av.id] = 0; 
      });
    }
    
    disciplina.alunos.push(aluno);
    importados++;
    
    if (window.addLog) window.addLog(`importou aluno ${nome} (${matricula}) via CSV para a turma ${turmaObj.nome} na disciplina ${disciplina.nome}`);
  }
  
  // Ordenar alunos alfabeticamente por nome
  disciplina.alunos.sort((a, b) => {
    const nomeA = (a.nome || '').toLowerCase();
    const nomeB = (b.nome || '').toLowerCase();
    return nomeA.localeCompare(nomeB);
  });
  
  instituicoes[instituicaoIndex].disciplinas[disciplinaIndex] = disciplina;
  saveAll();
  renderAlunos();
  
  let msgFinal = `CSV importado: ${importados} aluno(s) adicionado(s) à turma ${turmaObj.nome}`;
  if (duplicatas > 0) msgFinal += `, ${duplicatas} duplicata(s) evitada(s)`;
  if (errors > 0) msgFinal += `, ${errors} linha(s) com erro`;
  
  document.getElementById('msg').innerText = msgFinal; 
  document.getElementById('msg').style.color = importados > 0 ? 'green' : 'orange';
}

// Exportar tabela de alunos (com notas e média final) para CSV
function exportarTabelaCSV() {
  if (!ensureDisciplineStructure()) return;
  if (!turmaSelecionadaId) return alert('Selecione uma turma antes de exportar.');
  
  const turma = disciplina.turmas.find(t=>t.id === turmaSelecionadaId);
  if (!turma) return alert('Turma não encontrada.');
  
  // cabeçalhos: matrícula, nome, turma, avaliações, média final
  const headers = ['Matrícula', 'Nome', 'Turma'];
  const avaliacoes = Array.isArray(turma.avaliacoes) ? turma.avaliacoes : [];
  avaliacoes.forEach(av => headers.push(av.nome));
  headers.push('Média Final');
  
  // filtrar alunos da turma selecionada
  const alunosFiltrados = disciplina.alunos.filter(a => a.turma === turmaSelecionadaId);
  
  // construir linhas
  const linhas = [headers.map(h => `"${h}"`).join(',')];
  
  alunosFiltrados.forEach(aluno => {
    const row = [
      `"${aluno.matricula || ''}"`,
      `"${aluno.nome || ''}"`,
      `"${aluno.turma || ''}"`
    ];
    
    // adicionar notas para cada avaliação
    let somaFinal = 0;
    avaliacoes.forEach(av => {
      aluno.notas = aluno.notas || {};
      const nota = aluno.notas.hasOwnProperty(av.id) ? aluno.notas[av.id] : 0;
      row.push(String(nota));
      somaFinal += (Number(av.percentual||0) * Number(nota || 0)) / 100;
    });
    
    // adicionar média final
    row.push(String(somaFinal.toFixed(2)));
    
    linhas.push(row.join(','));
  });
  
  // criar e descarregar arquivo
  const csv = linhas.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  const nomeArquivo = `${disciplina.nome}_${turma.nome}_${new Date().toISOString().split('T')[0]}.csv`;
  link.setAttribute('href', url);
  link.setAttribute('download', nomeArquivo);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  if (window.addLog) window.addLog(`exportou tabela de alunos para CSV (turma: ${turma.nome})`);
}

// wire UI
document.addEventListener('DOMContentLoaded', () => {
  // se uma turma foi escolhida na página de Turmas, pré-selecionar aqui
  turmaSelecionadaId = localStorage.getItem('turmaSelecionada') || '';
  // NÃO remover a chave — deixar persistida para uso na página
  document.getElementById('addAlunoBtn').addEventListener('click', adicionarAluno);
  document.getElementById('importarBtn').addEventListener('click', () => {
    const f = document.getElementById('csvFile').files[0];
    if (!f) return alert('Selecione um arquivo CSV.');
    importarCSVFile(f);
  });
  document.getElementById('exportarBtn').addEventListener('click', exportarTabelaCSV);
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