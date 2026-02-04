$(function(){
  Alke.requireLogin();


  function refreshContacts(){
    const contacts = Alke.loadContacts();
    const list = $('#contactsListUI').empty();
    const datalist = $('#contactsList').empty();
    contacts.forEach((c, i) => {
      list.append(`<li class="list-group-item d-flex justify-content-between align-items-center">${c}<button class="btn btn-sm btn-danger btn-delete" data-i="${i}">Eliminar</button></li>`);
      datalist.append(`<option value="${c}">`);
    });
  }

  $('#addContactForm').on('submit', function(e){
    e.preventDefault();
    const name = $('#contactName').val().trim();
    if(!name) return;
    const contacts = Alke.loadContacts();
    contacts.unshift(name);
    Alke.saveContacts(contacts);
    $('#contactName').val('');
    Alke.showToast('Contacto agregado', 'success');
    refreshContacts();
  });

  $('#contactsListUI').on('click', '.btn-delete', function(){
    const i = $(this).data('i');
    const contacts = Alke.loadContacts();
    contacts.splice(i,1);
    Alke.saveContacts(contacts);
    Alke.showToast('Contacto eliminado', 'warning');
    refreshContacts();
  });

  $('#sendForm').on('submit', function(e){
    e.preventDefault();
    const to = $('#to').val().trim();
    const amount = parseFloat($('#amount').val());
    const note = $('#note').val().trim();
    if(!to || !amount || amount <= 0){
      Alke.showToast('Complete los campos correctamente', 'danger');
      return;
    }
    // Guardar transacción (egreso)
    const tx = Alke.loadTransactions();
    const date = Alke.currentDateTime();
    tx.unshift({date, description: `Envío a ${to} ${note ? '- ' + note : ''}`, amount: amount, type: 'out'});
    Alke.saveTransactions(tx);
    Alke.showToast('Transferencia realizada', 'success');
    // agregar contacto si no existe
    const contacts = Alke.loadContacts();
    if(!contacts.includes(to)){
      contacts.unshift(to);
      Alke.saveContacts(contacts);
    }
    refreshContacts();
    $('#sendForm')[0].reset();
  });

  $('#logoutBtn').click(Alke.logout);
  refreshContacts();
});