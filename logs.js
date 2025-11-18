// Simple client-side logger using localStorage
// Includes a queued-sending helper for future backend integration.
(function(){
  function getCurrentUser() {
    return localStorage.getItem('currentUser') || 'anônimo';
  }

  function _getLogs() {
    return JSON.parse(localStorage.getItem('logs') || '[]');
  }

  function _setLogs(arr) {
    localStorage.setItem('logs', JSON.stringify(arr));
  }

  function _getUnsent() {
    return JSON.parse(localStorage.getItem('unsentLogs') || '[]');
  }

  function _setUnsent(arr) {
    localStorage.setItem('unsentLogs', JSON.stringify(arr));
  }

  function addLog(message) {
    const entry = {
      id: 'log_' + Date.now() + '_' + Math.floor(Math.random()*1000),
      timestamp: new Date().toISOString(),
      user: getCurrentUser(),
      message
    };
    const logs = _getLogs();
    logs.unshift(entry); // newest first
    _setLogs(logs);
    // also queue for sending to server later
    const unsent = _getUnsent();
    unsent.unshift(entry);
    _setUnsent(unsent);
    return entry;
  }

  function renderLogs(containerId) {
    const container = document.getElementById(containerId || 'logsContainer');
    if (!container) return;
    const logs = _getLogs();
    container.innerHTML = '';
    if (logs.length === 0) {
      const p = document.createElement('p');
      p.style.color = 'white';
      p.innerText = 'Nenhum log ainda.';
      container.appendChild(p);
      return;
    }
    logs.forEach(l => {
      const div = document.createElement('div');
      div.style.marginBottom = '10px';
      div.style.color = 'white';
      div.innerText = `${new Date(l.timestamp).toLocaleString()} — ${l.user}: ${l.message}`;
      container.appendChild(div);
    });
  }

  // Try to send queued logs to server. The `url` should be provided by the backend team
  // Example usage: sendLogsToServer('/api/logs')
  async function sendLogsToServer(url) {
    const unsent = _getUnsent();
    if (!unsent || unsent.length === 0) return { ok: true, sent: 0 };
    // best-effort: send all unsent logs in one batch
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logs: unsent })
      });
      if (!res.ok) throw new Error('server returned ' + res.status);
      // on success, clear unsent queue
      _setUnsent([]);
      return { ok: true, sent: unsent.length };
    } catch (err) {
      console.warn('Envio de logs falhou:', err);
      return { ok: false, error: String(err), sent: 0 };
    }
  }

  // Expose helper to inspect unsent logs
  function getUnsentLogs() { return _getUnsent(); }

  // Auto-attempt to flush unsent logs when online (no URL configured here).
  // Call sendLogsToServer(url) from server-enabled environment.
  window.addEventListener('online', () => {
    // no-op by default; backend URL needed to actually send
    console.info('Back online — call sendLogsToServer(url) to flush logs to server');
  });

  // expose globally
  window.addLog = addLog;
  window.renderLogs = renderLogs;
  window.sendLogsToServer = sendLogsToServer;
  window.getUnsentLogs = getUnsentLogs;
})();

// -------------------------------------------------
// UI: inject a floating logs panel/tab that can be opened/closed from any page.
// The existing `.log-button` elements will be wired to toggle this panel.
// Auto-send: if localStorage.logsEndpoint is set, unsent logs will be sent automatically every 10s.
// -------------------------------------------------
(function(){
  const PANEL_ID = 'logsPanel';
  function createPanel() {
    if (document.getElementById(PANEL_ID)) return;
    const panel = document.createElement('div');
    panel.id = PANEL_ID;
    panel.className = 'logs-panel';
    panel.innerHTML = `
      <div class="logs-header">
        <div>
          <strong>Logs de Ações</strong>
          <div class="logs-note">(registros locais — enviados automaticamente quando configurado)</div>
        </div>
        <div>
          <button class="logs-close" title="Fechar">✕</button>
        </div>
      </div>
      <div class="logs-body" id="logsPanelContainer" style="font-size:13px; line-height:1.4;"></div>
    `;
    document.body.appendChild(panel);
    // close handler
    panel.querySelector('.logs-close').addEventListener('click', closePanel);
  }

  function openPanel() {
    createPanel();
    const p = document.getElementById(PANEL_ID);
    if (!p) return;
    p.classList.add('open');
    // render once immediately
    window.renderLogs && window.renderLogs('logsPanelContainer');
  }

  function closePanel(){
    const p = document.getElementById(PANEL_ID);
    if (!p) return;
    p.classList.remove('open');
  }

  function togglePanel(){
    const p = document.getElementById(PANEL_ID);
    if (!p || !p.classList.contains('open')) openPanel(); else closePanel();
  }

  // wire existing buttons with class 'log-button'
  function wireButtons(){
    document.querySelectorAll('.log-button').forEach(el => {
      // if it's an <a>, prevent navigation
      el.addEventListener('click', (e) => { e.preventDefault(); togglePanel(); });
      el.style.cursor = 'pointer';
    });
  }

  // auto-refresh panel logs every second when open
  setInterval(()=>{
    const panel = document.getElementById(PANEL_ID);
    if (panel && panel.classList.contains('open')) {
      window.renderLogs && window.renderLogs('logsPanelContainer');
    }
  }, 1000);

  // Auto-send loop: if an endpoint is configured in localStorage.logsEndpoint, try to send unsent logs every 10s
  async function autoSendLoop(){
    const url = localStorage.getItem('logsEndpoint');
    if (!url) return; // nothing configured
    try {
      const res = await window.sendLogsToServer(url);
      if (res && res.ok) console.info('Logs enviados automaticamente:', res.sent);
    } catch (err) { console.warn('Auto-send logs falhou:', err); }
  }
  // run every 10s
  setInterval(autoSendLoop, 10000);

  // try sending when back online (if endpoint exists)
  window.addEventListener('online', () => { setTimeout(autoSendLoop, 500); });

  // expose toggle for manual calls
  window.toggleLogs = togglePanel;

  // initialize
  document.addEventListener('DOMContentLoaded', () => { wireButtons(); createPanel(); });
})();
