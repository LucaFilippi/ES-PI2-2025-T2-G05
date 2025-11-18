const http = require('http');

function post(path, data) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const opts = { hostname: 'localhost', port: 3000, path, method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) } };
    const req = http.request(opts, res => {
      let b=''; res.on('data', c=>b+=c); res.on('end', ()=>{
        try { resolve({status: res.statusCode, body: JSON.parse(b||'{}')}); } catch(e) { resolve({status: res.statusCode, body: b}); }
      });
    });
    req.on('error', reject);
    req.write(payload); req.end();
  });
}

async function run() {
  // wait for server
  for (let i=0;i<8;i++) {
    try { await new Promise(r=>setTimeout(r,500)); await post('/api/instituicoes', {nome:'ping', cor:'#fff'}); break; } catch(e) { if (i===7) console.error('server unreachable'); }
  }
  try {
    console.log('Registering user...');
    let r = await post('/api/users/register', { nome: 'Demo User', email: 'demo@local', telefone: '(11)999999999', senha: 'senha123' });
    console.log('register:', r.status, r.body);
  } catch(e) { console.error('register error', e); }
  try {
    console.log('Requesting forgot...');
    let f = await post('/api/users/forgot', { email: 'demo@local' });
    console.log('forgot:', f.status, f.body);
    const code = f.body && f.body.code;
    if (code) {
      console.log('Resetting with code:', code);
      let res = await post('/api/users/reset', { token: code, senha: 'novaSenha123' });
      console.log('reset:', res.status, res.body);
    }
  } catch(e) { console.error('forgot/reset error', e); }
}

run();
