$(function(){
  Alke.requireLogin();

  function currentDateTime(){
    const d = new Date();
    const pad = n => String(n).padStart(2,'0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  }

  $('#depositForm').on('submit', function(e){
    e.preventDefault();
    const date = currentDateTime();
    const desc = $('#desc').val().trim();
    const amount = parseFloat($('#amount').val());
    if(!desc || !amount || amount <= 0){
      Alke.showToast('Complete los campos correctamente', 'danger');
      return;
    }
    const tx = Alke.loadTransactions();
    tx.unshift({date, description: desc, amount: amount, type: 'in'});
    Alke.saveTransactions(tx);
    Alke.showToast('Depósito realizado', 'success');
    setTimeout(()=>{ window.location = 'transactions.html'; }, 900);
  });
});