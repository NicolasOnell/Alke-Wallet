$(function(){
  Alke.requireLogin();

  $('#depositForm').on('submit', function(e){
    e.preventDefault();
    const date = Alke.currentDateTime();
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