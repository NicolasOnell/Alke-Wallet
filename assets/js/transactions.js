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

  $('#logoutBtn').click(Alke.logout);
  render();
});