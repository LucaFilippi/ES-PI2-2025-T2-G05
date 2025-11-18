
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

  // call server login
  fetch((window.API_BASE || '') + '/api/users/login', {
    method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ email, senha })
  }).then(r => r.json().then(b => ({status: r.status, body: b}))).then(({status, body}) => {
    if (status !== 200) {
      msg.style.color = 'red';
      msg.innerText = body.error || 'Credenciais inválidas';
      return;
    }
    msg.style.color = 'green';
    msg.innerText = 'Login efetuado com sucesso!';
    try { localStorage.setItem('currentUser', body.email || email); } catch(e){}
    if (window.addLog) window.addLog(`fez login ${email}`);
    setTimeout(()=> window.location.href = 'loading.html', 1200);
  }).catch(err => {
    msg.style.color = 'red'; msg.innerText = 'Erro de rede';
  });
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
  // call server to request reset code
  fetch((window.API_BASE || '') + '/api/users/forgot', {
    method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ email })
  }).then(r => r.json().then(b => ({status: r.status, body: b}))).then(({status, body}) => {
    if (status !== 200) {
      msg.style.color = 'red'; msg.innerText = body.error || 'Erro ao solicitar recuperação';
      return;
    }
    msg.style.color = 'green';
    msg.innerText = 'Email de recuperação enviado!';
    document.getElementById('codigoDiv').style.display = 'block';
    if (body.code) {
      // for demo: optionally show the code in console and in message
      console.log('Reset code (demo):', body.code);
      msg.innerText += ` Código (demo): ${body.code}`;
      try { navigator.clipboard && navigator.clipboard.writeText(body.code); } catch (e) {}
    }
    if (window.addLog) window.addLog(`solicitou recuperação de senha para ${email}`);
    // show email preview link if available
    if (body && body.preview) {
      const prevDiv = document.getElementById('recPreview');
      prevDiv.innerHTML = `<a href="${body.preview}" target="_blank">Abrir preview do email (Ethereal)</a>`;
    }
  }).catch(err => { msg.style.color='red'; msg.innerText='Erro de rede'; });
}

function reenviarEmail(){
  // simply call enviarEmail again
  enviarEmail();
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
  // call server to reset password using the code/token
  fetch((window.API_BASE || '') + '/api/users/reset', {
    method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ token: codigo, senha: novaSenha })
  }).then(r => r.json().then(b => ({status: r.status, body: b}))).then(({status, body}) => {
    if (status !== 200) {
      msg.style.color = 'red'; msg.innerText = body.error || 'Erro ao resetar senha';
      return;
    }
    msg.style.color = 'green';
    msg.innerText = 'Senha alterada com sucesso!';
    const email = document.getElementById('recEmail') ? document.getElementById('recEmail').value : '';
    if (window.addLog) window.addLog(`definiu nova senha para ${email}`);
    document.getElementById('codigoDiv').style.display = 'none';
  }).catch(err => { msg.style.color='red'; msg.innerText='Erro de rede'; });
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

  // call server to register
  fetch((window.API_BASE || '') + '/api/users/register', {
    method: 'POST', headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ nome, email, telefone: telefoneInput.value, senha })
  }).then(r => r.json().then(b => ({status: r.status, body: b}))).then(({status, body}) => {
    if (status !== 200) {
      msg.style.color = 'red'; msg.innerText = body.error || 'Erro ao cadastrar';
      return;
    }
    msg.style.color = 'green'; msg.innerText = 'Cadastro realizado com sucesso!';
    setTimeout(()=> window.location.href = 'index.html', 1200);
  }).catch(err => { msg.style.color='red'; msg.innerText='Erro de rede'; });
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
