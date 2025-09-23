// ---- LOGIN ----
function fazerLogin() {
  let email = document.getElementById('loginEmail').value;
  let senha = document.getElementById('loginSenha').value;
  let msg = document.getElementById('loginMsg');

  if (!email || !senha) {
    msg.style.color = "red";
    msg.innerText = "Preencha todos os campos!";
    return;
  }

  if (!email.includes('@')) {
    msg.style.color = "red";
    msg.innerText = "Digite um email válido.";
    return;
  }

  if (senha.length < 6) {
    msg.style.color = "red";
    msg.innerText = "Senha incorreta (mínimo 6 caracteres).";
    return;
  }

  msg.style.color = "green";
  msg.innerText = "Login efetuado com sucesso!";
  setTimeout(()=> window.location.href = "inicial_notadez.html", 2000);
}

// ---- CADASTRO ----
function fazerCadastro() {
  let nome = document.getElementById('cadNome').value;
  let email = document.getElementById('cadEmail').value;
  let telefone = document.getElementById('cadTelefone').value;
  let senha = document.getElementById('cadSenha').value;
  let senhaConf = document.getElementById('cadSenhaConf').value;
  let msg = document.getElementById('cadMsg');

  if (!nome || !email || !telefone || !senha || !senhaConf) {
    msg.style.color = "red";
    msg.innerText = "Preencha todos os campos!";
    return;
  }

  if (!email.includes('@')) {
    msg.style.color = "red";
    msg.innerText = "Digite um email válido.";
    return;
  }

  if (senha.length < 6) {
    msg.style.color = "red";
    msg.innerText = "A senha deve ter pelo menos 6 caracteres.";
    return;
  }

  if (senha !== senhaConf) {
    msg.style.color = "red";
    msg.innerText = "As senhas não coincidem.";
    return;
  }

  msg.style.color = "green";
  msg.innerText = "Cadastro realizado com sucesso!";
  setTimeout(()=> window.location.href = "index.html", 2000);
}

// ---- RECUPERAÇÃO ----
function enviarEmail() {
  let email = document.getElementById('recEmail').value;
  let msg = document.getElementById('recMsg');
  if (!email) {
    msg.style.color = "red";
    msg.innerText = "Digite seu email.";
    return;
  }
  if (!email.includes('@')) {
    msg.style.color = "red";
    msg.innerText = "Digite um email válido.";
    return;
  }
  msg.style.color = "green";
  msg.innerText = "Email de recuperação enviado!";
  document.getElementById('codigoDiv').style.display = "block";
}

function reenviarEmail(){
  let msg = document.getElementById('recMsg');
  msg.style.color = "green";
  msg.innerText = "Email reenviado!";
}

function definirNovaSenha(){
  let codigo = document.getElementById('codigo').value;
  let novaSenha = document.getElementById('novaSenha').value;
  let msg = document.getElementById('recMsg');

  if (codigo.length !== 4) {
    msg.style.color = "red";
    msg.innerText = "Digite um código válido (4 dígitos).";
    return;
  }

  if (novaSenha.length < 6) {
    msg.style.color = "red";
    msg.innerText = "A nova senha deve ter pelo menos 6 caracteres.";
    return;
  }

  msg.style.color = "green";
  msg.innerText = "Senha redefinida! Voltando ao login...";
  setTimeout(()=> window.location.href = "index.html", 2000);
}
