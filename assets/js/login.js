$(function(){
  $('#loginForm').on('submit', function(e){
    e.preventDefault();
    const user = $('#username').val().trim();
    const pass = $('#password').val().trim();
    if(!user || !pass){
      Alke.showToast('Complete ambos campos', 'danger');
      return;
    }
    // Validación simple: aceptar cualquier credencial no vacía
    localStorage.setItem(Alke.USER_KEY, JSON.stringify({username:user}));
    window.location = 'menu.html';
  });
});