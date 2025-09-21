// Simulação de login
function fazerLogin() {
  let email = document.getElementById('loginEmail').value;
  let senha = document.getElementById('loginSenha').value;
  let msg = document.getElementById('loginMsg');

  if (email && senha) {
    msg.style.color = "green";
    msg.innerText = "Login efetuado com sucesso, direcionando à página principal...";
  } else {
    msg.style.color = "red";
    msg.innerText = "Preencha todos os campos!";
  }
}

// Simulação de cadastro
function fazerCadastro() {
  let email = document.getElementById('cadEmail').value;
  let emailConf = document.getElementById('cadEmailConf').value;
  let senha = document.getElementById('cadSenha').value;
  let senhaConf = document.getElementById('cadSenhaConf').value;
  let msg = document.getElementById('cadMsg');

  if (email && senha && email === emailConf && senha === senhaConf) {
    msg.style.color = "green";
    msg.innerText = "Cadastro realizado com sucesso!";
    setTimeout(()=> window.location.href = "index.html", 2000);
  } else {
    msg.style.color = "red";
    msg.innerText = "Verifique os dados preenchidos.";
  }
}

// Simulação de recuperação de senha
function enviarEmail() {
  let email = document.getElementById('recEmail').value;
  let msg = document.getElementById('recMsg');
  if (email) {
    msg.style.color = "green";
    msg.innerText = "Email de recuperação enviado!";
    document.getElementById('codigoDiv').style.display = "block";
  } else {
    msg.style.color = "red";
    msg.innerText = "Digite seu email.";
  }
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

  if(codigo.length === 4 && novaSenha){
    msg.style.color = "green";
    msg.innerText = "Senha redefinida! Voltando ao login...";
    setTimeout(()=> window.location.href = "index.html", 2000);
  } else {
    msg.style.color = "red";
    msg.innerText = "Digite código válido e nova senha.";
  }
}

