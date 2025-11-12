// Autor: Luca Filippi
let instituicoes = JSON.parse(localStorage.getItem("instituicoes")) || [];
let indexSelecionado = localStorage.getItem("instituicaoSelecionada");
let instituicao = instituicoes[indexSelecionado];

function renderDisciplinas() {
  document.getElementById("nomeInstituicaoTitulo").innerText = instituicao.nome;
  const container = document.getElementById("disciplinasContainer");
  container.innerHTML = "";
  instituicao.disciplinas.forEach((disc, idx) => {
    const card = document.createElement("div");
    card.style.background = disc.cor;
    card.style.color = "white";
    card.style.borderRadius = "10px";
    card.style.padding = "15px";
    card.style.width = "180px";
    card.style.cursor = "pointer";
    card.innerHTML = `
      <h3>${disc.nome}</h3>
      <p>${disc.codigo}</p>
      <div style="margin-top:10px; display:flex; gap:8px; justify-content:center;">
        <button class="btn-edit" style="background:#f39c12; border:none; padding:6px 8px; border-radius:6px; cursor:pointer;">Editar</button>
        <button class="btn-delete" style="background:#c0392b; color:white; border:none; padding:6px 8px; border-radius:6px; cursor:pointer;">Excluir</button>
      </div>
    `;
    // abrir ao clicar no card (exceto nos botões)
  card.onclick = () => abrirTurmas(idx);
    // prevenir propagação dos cliques nos botões
    const btnEdit = card.querySelector('.btn-edit');
    const btnDelete = card.querySelector('.btn-delete');
    btnEdit.onclick = (e) => { e.stopPropagation(); editarDisciplina(idx); };
    btnDelete.onclick = (e) => { e.stopPropagation(); excluirDisciplina(idx); };
    container.appendChild(card);
  });
}

function adicionarDisciplina() {
  const nome = document.getElementById("nomeDisciplina").value.trim();
  const codigo = document.getElementById("codigoDisciplina").value.trim();
  const cor = document.getElementById("corDisciplina").value;
  if (!nome || !codigo) {
    alert("Preencha o nome e código da disciplina.");
    return;
  }
  instituicao.disciplinas.push({ nome, codigo, cor });
  instituicoes[indexSelecionado] = instituicao;
  localStorage.setItem("instituicoes", JSON.stringify(instituicoes));
  // log
  if (window.addLog) window.addLog(`adicionou a disciplina ${nome} (${codigo}) na instituição ${instituicao.nome}`);
  renderDisciplinas();
  document.getElementById("nomeDisciplina").value = "";
  document.getElementById("codigoDisciplina").value = "";
}

function abrirTurmas(idx) {
  localStorage.setItem("disciplinaSelecionada", idx);
  window.location.href = "turmas.html";
}

function editarDisciplina(idx) {
  const disc = instituicao.disciplinas[idx];
  const novoNome = prompt('Nome da disciplina:', disc.nome);
  if (novoNome === null) return; // cancelou
  const novoCodigo = prompt('Código da disciplina:', disc.codigo);
  if (novoCodigo === null) return;
  const novaCor = prompt('Cor (hex) da disciplina:', disc.cor) || disc.cor;
  const oldNome = disc.nome;
  const oldCodigo = disc.codigo;
  instituicao.disciplinas[idx] = { nome: novoNome.trim() || disc.nome, codigo: novoCodigo.trim() || disc.codigo, cor: novaCor };
  instituicoes[indexSelecionado] = instituicao;
  localStorage.setItem("instituicoes", JSON.stringify(instituicoes));
  // log
  if (window.addLog) window.addLog(`alterou a disciplina ${oldNome} (${oldCodigo}) para ${instituicao.disciplinas[idx].nome} (${instituicao.disciplinas[idx].codigo}) na instituição ${instituicao.nome}`);
  renderDisciplinas();
}

function excluirDisciplina(idx) {
  if (!confirm('Confirma exclusão desta disciplina?')) return;
  const disc = instituicao.disciplinas[idx];
  instituicao.disciplinas.splice(idx, 1);
  instituicoes[indexSelecionado] = instituicao;
  localStorage.setItem("instituicoes", JSON.stringify(instituicoes));
  // log
  if (window.addLog) window.addLog(`deletou a disciplina ${disc.nome} (${disc.codigo}) da instituição ${instituicao.nome}`);
  renderDisciplinas();
}

function voltarInstituicoes() {
  window.location.href = "instituicoes.html";
}

document.addEventListener("DOMContentLoaded", renderDisciplinas);
