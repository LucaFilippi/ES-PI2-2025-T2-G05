
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
  // set current user and log
  try { localStorage.setItem('currentUser', email); } catch(e){}
  if (window.addLog) window.addLog(`fez login`);
  setTimeout(()=> window.location.href = "loading.html", 2000);
}


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


  let telefoneRegex = /^\(\d{2}\)\d{9}$/;
  if (!telefoneRegex.test(telefone)) {
    msg.style.color = "red";
    msg.innerText = "Telefone inválido. Use o formato (DD)999999999.";
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
  // log registration
  if (window.addLog) window.addLog(`criou a conta ${email}`);
  setTimeout(()=> window.location.href = "index.html", 2000);
}


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
  if (window.addLog) window.addLog(`solicitou recuperação de senha para ${email}`);
}

function reenviarEmail(){
  let msg = document.getElementById('recMsg');
  msg.style.color = "green";
  msg.innerText = "Email reenviado!";
  const email = document.getElementById('recEmail') ? document.getElementById('recEmail').value : '';
  if (window.addLog) window.addLog(`reenviou email de recuperação para ${email}`);
}

function definirNovaSenha(){
  const codigo = document.getElementById('codigo').value;
  const novaSenha = document.getElementById('novaSenha').value;
  const msg = document.getElementById('recMsg');
  if (!codigo || !novaSenha) {
    msg.style.color = 'red';
    msg.innerText = 'Preencha código e nova senha.';
    return;
  }
  if (novaSenha.length < 6) {
    msg.style.color = 'red';
    msg.innerText = 'A nova senha deve ter pelo menos 6 caracteres.';
    return;
  }
  msg.style.color = 'green';
  msg.innerText = 'Senha alterada com sucesso!';
  const email = document.getElementById('recEmail') ? document.getElementById('recEmail').value : '';
  if (window.addLog) window.addLog(`definiu nova senha para ${email}`);
  // hide code input
  document.getElementById('codigoDiv').style.display = 'none';
}

function fazerCadastro() {
  let nome = document.getElementById('cadNome').value;
  let email = document.getElementById('cadEmail').value;
  let telefoneInput = document.getElementById('cadTelefone');
  let telefone = telefoneInput.value;
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

  let telefoneNumeros = telefone.replace(/\D/g, "");
  if (telefoneNumeros.length !== 11) {
    msg.style.color = "red";
    msg.innerText = "Telefone deve conter 11 números.";
    return;
  }
  
  let telefoneFormatado = `(${telefoneNumeros.substring(0,2)})${telefoneNumeros.substring(2)}`;
  telefoneInput.value = telefoneFormatado;

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

const telefoneInput = document.getElementById('cadTelefone');
if (telefoneInput) {
  telefoneInput.addEventListener('input', function(e) {
    let numeros = this.value.replace(/\D/g, "");
    if (numeros.length > 11) numeros = numeros.slice(0,11);
    let formatado = numeros;
    if (numeros.length > 2) {
      formatado = `(${numeros.substring(0,2)})${numeros.substring(2)}`;
    }
    this.value = formatado;
  });
}
