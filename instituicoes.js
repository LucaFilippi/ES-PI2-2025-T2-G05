// Autor: Luca Filippi
let instituicoes = JSON.parse(localStorage.getItem("instituicoes")) || [];

function renderInstituicoes() {
  const container = document.getElementById("instituicoesContainer");
  container.innerHTML = "";
  instituicoes.forEach((inst, index) => {
    const card = document.createElement("div");
    card.style.background = inst.cor;
    card.style.color = "white";
    card.style.borderRadius = "10px";
    card.style.padding = "15px";
    card.style.width = "180px";
    card.style.cursor = "pointer";
    // montar conteúdo com botões de editar/excluir
    const hasDisciplinas = Array.isArray(inst.disciplinas) && inst.disciplinas.length > 0;
    card.innerHTML = `
      <h3>${inst.nome}</h3>
      <div style="margin-top:10px; display:flex; gap:8px; justify-content:center;">
        <button class="btn-edit" style="background:#f39c12; border:none; padding:6px 8px; border-radius:6px; cursor:pointer;">Editar</button>
        ${hasDisciplinas ? '' : '<button class="btn-delete" style="background:#c0392b; color:white; border:none; padding:6px 8px; border-radius:6px; cursor:pointer;">Excluir</button>'}
      </div>
    `;
    card.onclick = () => abrirDisciplinas(index);
    // attach handlers
    const btnEdit = card.querySelector('.btn-edit');
    if (btnEdit) {
      btnEdit.onclick = (e) => { e.stopPropagation(); editarInstituicao(index); };
    }
    const btnDelete = card.querySelector('.btn-delete');
    if (btnDelete) {
      btnDelete.onclick = (e) => { e.stopPropagation(); excluirInstituicao(index); };
    }
    container.appendChild(card);
  });
}

function adicionarInstituicao() {
  const nome = document.getElementById("nomeInstituicao").value.trim();
  const cor = document.getElementById("corInstituicao").value;
  if (!nome) {
    alert("Digite um nome para a instituição.");
    return;
  }
  instituicoes.push({ nome, cor, disciplinas: [] });
  localStorage.setItem("instituicoes", JSON.stringify(instituicoes));
  if (window.addLog) window.addLog(`adicionou a instituição ${nome}`);
  renderInstituicoes();
  document.getElementById("nomeInstituicao").value = "";
}

function abrirDisciplinas(index) {
  localStorage.setItem("instituicaoSelecionada", index);
  window.location.href = "disciplinas.html";
}

function editarInstituicao(index) {
  const inst = instituicoes[index];
  const novoNome = prompt('Nome da instituição:', inst.nome);
  if (novoNome === null) return;
  const novaCor = prompt('Cor (hex) da instituição:', inst.cor) || inst.cor;
  const oldNome = inst.nome;
  instituicoes[index] = { ...inst, nome: novoNome.trim() || inst.nome, cor: novaCor };
  localStorage.setItem("instituicoes", JSON.stringify(instituicoes));
  if (window.addLog) window.addLog(`alterou o nome da instituição ${oldNome} para ${instituicoes[index].nome}`);
  renderInstituicoes();
}

function excluirInstituicao(index) {
  const inst = instituicoes[index];
  if (Array.isArray(inst.disciplinas) && inst.disciplinas.length > 0) {
    alert('Não é possível excluir uma instituição que possui disciplinas cadastradas.');
    return;
  }
  if (!confirm('Confirma exclusão desta instituição?')) return;
  instituicoes.splice(index, 1);
  localStorage.setItem("instituicoes", JSON.stringify(instituicoes));
  if (window.addLog) window.addLog(`deletou a instituição ${inst.nome}`);
  renderInstituicoes();
}

document.addEventListener("DOMContentLoaded", renderInstituicoes);
