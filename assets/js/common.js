(function($){
  const TX_KEY = 'alke_transactions';
  const CONTACTS_KEY = 'alke_contacts';
  const USER_KEY = 'alke_user';

  // Transacciones por defecto 
  const DEFAULT_TRANSACTIONS = [
    { date: '2026-02-01 08:00:00', description: 'Sueldo', amount: 700000.00, type: 'in', immutable: true },
    { date: '2026-02-02 12:15:00', description: 'Alquiler', amount: 300000.00, type: 'out', immutable: true }
  ];

  function loadUserTransactions(){
    return JSON.parse(localStorage.getItem(TX_KEY) || '[]');
  }

  function saveUserTransactions(userTx){
    localStorage.setItem(TX_KEY, JSON.stringify(userTx));
  }

  function loadTransactions(){
    // Combina transacciones por defecto con las del usuario (las por defecto siempre primero)
    return DEFAULT_TRANSACTIONS.concat(loadUserTransactions());
  }

  function saveTransactions(tx){
    // Guardar solo las transacciones del usuario (filtrando las por defecto/immutables)
    const userOnly = tx.filter(t => !t.immutable);
    saveUserTransactions(userOnly);
  }

  function loadContacts(){
    return JSON.parse(localStorage.getItem(CONTACTS_KEY) || '[]');
  }
  function saveContacts(c){
    localStorage.setItem(CONTACTS_KEY, JSON.stringify(c));
  }

  function getBalance(){
    const tx = loadTransactions();
    return tx.reduce((acc, t) => acc + (t.type === 'in' ? Number(t.amount) : -Number(t.amount)), 0);
  }

  function formatCurrency(v){
    // Mostrar montos sin decimales con separador de miles (locale es-AR)
    const n = Number(v) || 0;
    const rounded = Math.round(n);
    return '$' + rounded.toLocaleString('es-AR');
  }

  function requireLogin(){
    const user = localStorage.getItem(USER_KEY);
    if(!user){
      window.location = 'login.html';
    }
  }

  function logout(){
    localStorage.removeItem(USER_KEY);
    window.location = 'login.html';
  }

  // Inicializar datos de ejemplo si está vacío
  if(!localStorage.getItem(TX_KEY)){
    saveTransactions([
      { date: '2026-02-01 08:00:00', description: 'Sueldo', amount: 1500.00, type: 'in' },
      { date: '2026-02-02 12:15:00', description: 'Alquiler', amount: 500.00, type: 'out' }
    ]);
  }
  if(!localStorage.getItem(CONTACTS_KEY)){
    saveContacts(['María','Carlos']);
  }

  // Agregar contenedor de toast dinámicamente si no existe
  $(function(){
    if(!document.getElementById('alke-toast-container')){
      const toastHtml = `
        <div id="alke-toast-container" class="position-fixed bottom-0 end-0 p-3" style="z-index: 1080;">
          <div id="alke-toast" class="toast align-items-center text-bg-primary border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
              <div class="toast-body"></div>
              <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
          </div>
        </div>
      `;
      $('body').append(toastHtml);
    }
  });

  function showToast(message, type = 'primary', delay = 3000){
    const toastEl = document.getElementById('alke-toast');
    if(!toastEl) return;
    // Update style
    toastEl.className = `toast align-items-center text-bg-${type} border-0`;
    $(toastEl).find('.toast-body').text(message);
    const toast = bootstrap.Toast.getOrCreateInstance(toastEl, { delay });
    toast.show();
  }

  // Exponer
  window.Alke = {
    DEFAULT_TRANSACTIONS,
    DEFAULT_TX_COUNT: DEFAULT_TRANSACTIONS.length,
    loadTransactions, loadUserTransactions, saveTransactions, saveUserTransactions,
    loadContacts, saveContacts,
    formatCurrency, getBalance, requireLogin, logout,
    showToast,
    USER_KEY
  };
})(jQuery);