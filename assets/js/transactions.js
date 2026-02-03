$(function(){
  Alke.requireLogin();
  function render(){
    const tx = Alke.loadTransactions();
    const tbody = $('#transactionsTable tbody').empty();
    tx.forEach((t) => {
      const tr = $('<tr>');
      tr.append($('<td>').text(t.date));
      tr.append($('<td>').text(t.description));
      tr.append($('<td>').text(Alke.formatCurrency(t.amount)));
      tr.append($('<td>').text(t.type === 'in' ? 'Ingreso' : 'Egreso'));
      tbody.append(tr);
    });
    // update balance
    if($('#balance').length) $('#balance').text(Alke.formatCurrency(Alke.getBalance()));
  }

  function removeUser(i){
    // i es el índice relativo dentro de las transacciones del usuario
    const userTx = Alke.loadUserTransactions();
    userTx.splice(i,1);
    Alke.saveUserTransactions(userTx);
    Alke.showToast('Transacción eliminada', 'warning');
    render();
  }

  $('#logoutBtn').click(Alke.logout);
  render();
});