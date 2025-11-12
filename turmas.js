// Autor: Implementação de Turmas
let instituicoes_t = JSON.parse(localStorage.getItem('instituicoes')) || [];
let instituicaoIndex_t = parseInt(localStorage.getItem('instituicaoSelecionada'));
let disciplinaIndex_t = parseInt(localStorage.getItem('disciplinaSelecionada'));
let disciplina_t = null;

function saveAll_t() {
  localStorage.setItem('instituicoes', JSON.stringify(instituicoes_t));
}

function ensureDisc() {
  if (!instituicoes_t || isNaN(instituicaoIndex_t)) return false;
  const inst = instituicoes_t[instituicaoIndex_t];
  if (!inst) return false;
  if (isNaN(disciplinaIndex_t)) return false;
  if (!Array.isArray(inst.disciplinas) || !inst.disciplinas[disciplinaIndex_t]) return false;
  disciplina_t = inst.disciplinas[disciplinaIndex_t];
  if (!Array.isArray(disciplina_t.turmas)) disciplina_t.turmas = [];
  if (!Array.isArray(disciplina_t.alunos)) disciplina_t.alunos = [];
  return true;
}

function renderTurmas() {
  if (!ensureDisc()) return;
  document.getElementById('disciplinaTitulo').innerText = `Turmas — ${disciplina_t.nome}`;
  const container = document.getElementById('turmasContainer');
  container.innerHTML = '';
  disciplina_t.turmas.forEach((turma, idx) => {
    const card = document.createElement('div');
    card.style.background = disciplina_t.cor || '#273c75';
    card.style.color = 'white';
    card.style.borderRadius = '10px';
    card.style.padding = '15px';
    card.style.width = '220px';
    card.style.cursor = 'pointer';
    card.innerHTML = `
      <h3>${turma.nome}</h3>
      <p>ID: ${turma.id}</p>
      <div style="margin-top:10px; display:flex; gap:8px; justify-content:center;">
        <button class="btn-manage" style="background:#2ecc71; border:none; padding:6px 8px; border-radius:6px; cursor:pointer;">Gerenciar</button>
        <button class="btn-edit" style="background:#f39c12; border:none; padding:6px 8px; border-radius:6px; cursor:pointer;">Editar</button>
        <button class="btn-delete" style="background:#c0392b; color:white; border:none; padding:6px 8px; border-radius:6px; cursor:pointer;">Excluir</button>
      </div>
    `;
    const btnManage = card.querySelector('.btn-manage');
    const btnEdit = card.querySelector('.btn-edit');
    const btnDelete = card.querySelector('.btn-delete');
    btnManage.onclick = (e) => { e.stopPropagation(); abrirGerenciadorTurma(idx); };
    btnEdit.onclick = (e) => { e.stopPropagation(); editarTurma(idx); };
    btnDelete.onclick = (e) => { e.stopPropagation(); excluirTurma(idx); };
    // clicar no card abre diretamente a página de Alunos para esta turma
    card.onclick = () => abrirAlunosTurma(idx);
    container.appendChild(card);
  });
}

function abrirAlunosTurma(idx) {
  if (!ensureDisc()) return;
  const turma = disciplina_t.turmas[idx];
  if (!turma) return;
  // armazenar a turma selecionada para a página de alunos ler e pré-selecionar
  localStorage.setItem('turmaSelecionada', turma.id);
  // garantir disciplina selecionada também
  localStorage.setItem('disciplinaSelecionada', String(disciplinaIndex_t));
  window.location.href = 'alunos.html';
}

function criarTurma() {
  if (!ensureDisc()) return;
  const nome = document.getElementById('nomeTurmaInput').value.trim();
  if (!nome) return alert('Informe o nome da turma.');
  const id = 'turma_' + Date.now();
  disciplina_t.turmas.push({ id, nome, avaliacoes: [] });
  instituicoes_t[instituicaoIndex_t].disciplinas[disciplinaIndex_t] = disciplina_t;
  saveAll_t();
  document.getElementById('nomeTurmaInput').value = '';
  renderTurmas();
  if (window.addLog) window.addLog(`criou a turma ${nome} na disciplina ${disciplina_t.nome}`);
}

function editarTurma(idx) {
  if (!ensureDisc()) return;
  const turma = disciplina_t.turmas[idx];
  const novo = prompt('Nome da turma:', turma.nome);
  if (novo === null) return;
  const old = turma.nome;
  turma.nome = novo.trim() || turma.nome;
  instituicoes_t[instituicaoIndex_t].disciplinas[disciplinaIndex_t] = disciplina_t;
  saveAll_t();
  renderTurmas();
  if (window.addLog) window.addLog(`renomeou a turma ${old} para ${turma.nome} na disciplina ${disciplina_t.nome}`);
}

function excluirTurma(idx) {
  if (!ensureDisc()) return;
  const turma = disciplina_t.turmas[idx];
  if (!confirm(`Confirma exclusão da turma ${turma.nome}?`)) return;
  // opcional: remover notas relacionadas
  disciplina_t.turmas.splice(idx, 1);
  instituicoes_t[instituicaoIndex_t].disciplinas[disciplinaIndex_t] = disciplina_t;
  saveAll_t();
  renderTurmas();
  if (window.addLog) window.addLog(`deletou a turma ${turma.nome} da disciplina ${disciplina_t.nome}`);
}

function abrirGerenciadorTurma(idx) {
  if (!ensureDisc()) return;
  const turma = disciplina_t.turmas[idx];
  const area = document.getElementById('detalheTurmaArea');
  area.innerHTML = '';

  const title = document.createElement('h3'); title.innerText = `Gerenciar: ${turma.nome}`; area.appendChild(title);

  const avalList = document.createElement('div');
  avalList.id = 'avalList';
  area.appendChild(avalList);

  function renderAvaliacoes() {
    avalList.innerHTML = '';
    const ul = document.createElement('ul');
    turma.avaliacoes.forEach((a, i) => {
      const li = document.createElement('li');
      li.innerText = `${a.nome} — ${a.percentual}% `;
      const btnRem = document.createElement('button'); btnRem.innerText = 'Remover'; btnRem.style.marginLeft='8px';
      btnRem.onclick = () => { if (!confirm('Remover avaliação?')) return; turma.avaliacoes.splice(i,1); instituicoes_t[instituicaoIndex_t].disciplinas[disciplinaIndex_t]=disciplina_t; saveAll_t(); renderAvaliacoes(); };
      li.appendChild(btnRem);
      ul.appendChild(li);
    });
    avalList.appendChild(ul);
    const soma = turma.avaliacoes.reduce((s,x)=>s + Number(x.percentual||0),0);
    const somaEl = document.createElement('p'); somaEl.innerText = `Soma dos percentuais: ${soma}%`;
    avalList.appendChild(somaEl);
  }

  renderAvaliacoes();

  const form = document.createElement('div'); form.style.marginTop='12px';
  form.innerHTML = `
    <input type="text" id="nomeAvaliacaoInput" placeholder="Nome da avaliação">
    <input type="number" id="percentAvaliacaoInput" placeholder="%" style="width:80px;">
    <button id="addAvaliacaoBtn">Adicionar avaliação</button>
    <button id="confirmAvaliacoesBtn">Confirmar avaliações (validar 100%)</button>
    <p id="msgAval"></p>
  `;
  area.appendChild(form);

  document.getElementById('addAvaliacaoBtn').onclick = () => {
    const nome = document.getElementById('nomeAvaliacaoInput').value.trim();
    const perc = parseFloat(document.getElementById('percentAvaliacaoInput').value);
    if (!nome || isNaN(perc)) return alert('Informe nome e percentual.');
    const id = 'aval_' + Date.now() + '_' + Math.floor(Math.random()*1000);
    turma.avaliacoes.push({ id, nome, percentual: perc });
    // initialize notas 0 for matching alunos
    disciplina_t.alunos.forEach(a => {
      // treat aluno.turma referencing id or name
      if (a.turma === turma.id || a.turma === turma.nome) {
        a.notas = a.notas || {};
        a.notas[id] = 0;
      }
    });
    instituicoes_t[instituicaoIndex_t].disciplinas[disciplinaIndex_t] = disciplina_t;
    saveAll_t();
    document.getElementById('nomeAvaliacaoInput').value = '';
    document.getElementById('percentAvaliacaoInput').value = '';
    renderAvaliacoes();
    if (window.addLog) window.addLog(`adicionou a avaliação ${nome} (${perc}%) na turma ${turma.nome} da disciplina ${disciplina_t.nome}`);
  };

  document.getElementById('confirmAvaliacoesBtn').onclick = () => {
    const soma = turma.avaliacoes.reduce((s,x)=>s + Number(x.percentual||0),0);
    const msg = document.getElementById('msgAval');
    if (turma.avaliacoes.length < 1) { msg.innerText = 'É necessário pelo menos 1 método de avaliação.'; msg.style.color='red'; return; }
    if (soma !== 100) { msg.innerText = 'A soma dos percentuais deve ser exatamente 100%.'; msg.style.color='red'; return; }
    msg.innerText = 'Avaliações confirmadas.'; msg.style.color='green';
    // nothing more to do aside from persisting (already persisted on add)
  };
}

// inicialização
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('criarTurmaBtn').addEventListener('click', criarTurma);
  renderTurmas();
});
