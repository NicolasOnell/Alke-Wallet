$(function () {

/* =====================================================
   GLOBAL STORAGE
===================================================== */

let saldo = parseInt(localStorage.getItem('saldo'), 10) || 500000;
let contacts = JSON.parse(localStorage.getItem('contacts')) || [
    { name: 'John Doe', cbu: '123456789', alias: 'john.doe', bank: 'ABC Bank' },
    { name: 'Jane Smith', cbu: '987654321', alias: 'jane.smith', bank: 'XYZ Bank' }
];
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];


/* =====================================================
   HELPERS
===================================================== */

function saveSaldo() {
    localStorage.setItem('saldo', saldo);
}

function saveContacts() {
    localStorage.setItem('contacts', JSON.stringify(contacts));
}

function saveTransactions() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
}

function addTransaction(obj) {
    transactions.push({
        ...obj,
        timestamp: Date.now()
    });
    saveTransactions();
}

// Formatear montos en CLP con separador de miles "."
function formatCLP(value) {
    const n = Number(value || 0);
    return `$${new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 }).format(n)} CLP`;
}


/* =====================================================
   LOGIN PAGE
===================================================== */

if ($('#loginPage').length) {

    const $alert = $('#alert-container');

    $('#loginForm').submit(function (e) {

        e.preventDefault();

        const user = $('#username').val();
        const pass = $('#password').val();

        if (user === 'admin' && pass === '1234') {

            $alert.html(`
                <div class="alert alert-success">
                    Inicio de sesión exitoso...
                </div>
            `);

            setTimeout(() => {
                window.location.href = 'menu.html';
            }, 1200);

        } else {

            $alert.html(`
                <div class="alert alert-danger">
                    Credenciales incorrectas
                </div>
            `);
        }
    });
}


/* =====================================================
   MENU PAGE
===================================================== */

if ($('#menuPage').length) {

    $('#saldoActual').text(formatCLP(saldo));

    $('a.menu-btn').click(function (e) {

        e.preventDefault();

        const destino = $(this).attr('href');
        const texto = $(this).text();

        $('#alert-container').html(`
            <div class="alert alert-info">
                Redirigiendo a ${texto}...
            </div>
        `);

        setTimeout(() => {
            window.location.href = destino;
        }, 800);
    });
}


/* =====================================================
   DEPOSIT PAGE
===================================================== */

if ($('#depositPage').length) {

    const $alert = $('#alert-container');

    $('#saldoActual').text(formatCLP(saldo));

    $('#depositBtn').on('click', function () {

        const amount = Number($('#depositAmount').val());
        if (!amount || amount <= 0) return;

        saldo += amount;
        saveSaldo();

        addTransaction({
            type: 'Depósito',
            amount: amount
        });

        $('#saldoActual').text(formatCLP(saldo));

        $alert.html(`
            <div class="alert alert-success">
                Depositaste ${formatCLP(amount)} correctamente
            </div>
        `);

        setTimeout(() => {
            window.location.href = 'menu.html';
        }, 2000);
    });
}


/* =====================================================
   SEND MONEY PAGE
   ✔ modal show/hide
   ✔ validaciones
   ✔ búsqueda (exacta por Enter o click)
   ✔ botón enviar dinámico
   ✔ confirmación por modal
   ✔ edición libre del campo de búsqueda
===================================================== */

if ($('#sendPage').length) {

    const $list = $('#contactList');
    const $sendBtn = $('#sendBtn');
    const $searchInput = $('#searchContact');
    const $searchForm = $('#searchForm');

    // Índice del contacto activo
    let activeIndex = null;

    // Estado inicial oculto y con d-none (Bootstrap usa !important)
    $sendBtn.addClass('d-none').hide();

    // Helper para activar un contacto y mostrar botón
    function setActiveContact(index, reflectInput = false) {
        activeIndex = index;
        $('.contact-item').removeClass('active');
        $(`.contact-item[data-index="${index}"]`).addClass('active');
        $sendBtn.removeClass('d-none').show();
        // Reflejar en el input solo cuando se selecciona desde la lista
        if (reflectInput) {
            $searchInput.val(contacts[index].name);
        }
    }

    // Función para ejecutar la transferencia (reutilizable desde modal o confirm)
    function performTransfer(index, amount) {
        saldo -= amount;
        saveSaldo();

        addTransaction({
            type: 'Transferencia enviada',
            to: contacts[index].name,
            amount
        });

        $('#transferMsg').html(`
            <div class="alert alert-success">
                Transferencia realizada con éxito
            </div>
        `);

        // Reset UI
        activeIndex = null;
        $('.contact-item').removeClass('active');
        $sendBtn.addClass('d-none').hide();
        $('#transferAmount').val('');
    }

    // === Autocompletado "Nombre" con contactos guardados ===
    if ($searchInput.length) {
        if (!$('#contactsDatalist').length) {
            $('body').append('<datalist id="contactsDatalist"></datalist>');
        }
        $searchInput.attr('list', 'contactsDatalist');
    }

    function renderContactsDatalist() {
        const $dl = $('#contactsDatalist');
        if (!$dl.length) return;
        $dl.empty();
        const seen = new Set();

        contacts.forEach(c => {
            const v = String(c.name || '').trim();
            const key = v.toLowerCase();
            if (v && !seen.has(key)) {
                $dl.append($('<option>').attr('value', v));
                seen.add(key);
            }
        });
    }

    function renderContacts() {
        $list.empty();

        contacts.forEach((c, i) => {
            const $li = $('<li>')
                .addClass('list-group-item contact-item d-flex justify-content-between align-items-center')
                .attr('data-index', i);

            const $div = $('<div>');
            $div.append($('<strong>').text(c.name));
            $div.append('<br>');
            $div.append($('<small>').text(`CBU: ${c.cbu} | Alias: ${c.alias} | ${c.bank}`));

            const $btn = $('<button>')
                .addClass('btn btn-sm btn-danger delete')
                .text('Eliminar');

            $li.append($div).append($btn);
            $list.append($li);
        });
    }

    renderContacts();
    renderContactsDatalist();

    // eliminar contacto (delegado, funciona para elementos dinámicos)
    $list.on('click', '.delete', function (e) {
        e.stopPropagation(); // evita seleccionar el ítem al eliminar

        const index = Number($(this).closest('.contact-item').attr('data-index'));
        if (!Number.isInteger(index)) return;

        if (!confirm('¿Eliminar este contacto?')) return;

        // Eliminar
        contacts.splice(index, 1);
        saveContacts();

        // Re-render
        renderContacts();
        renderContactsDatalist();

        // Si el eliminado estaba activo, limpiar selección
        if (activeIndex === index) {
            activeIndex = null;
            $searchInput.val('');
            $sendBtn.addClass('d-none').hide();
        } else {
            // Si se eliminó un contacto anterior al activo, el índice activo cambia
            if (activeIndex !== null && index < activeIndex) {
                activeIndex -= 1;
            }
        }
    });

    /* ===== VALIDACIONES ===== */
    $('#contactName, #contactBank').on('input', function () {
        this.value = this.value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ ]/g, '');
    });

    $('#contactCbu').on('input', function () {
        this.value = this.value.replace(/\D/g, '');
    });

    /* ===== BÚSQUEDA DE CONTACTOS ===== */
    if ($searchForm.length) {
        // Enviar con Enter desde el input
        $searchInput.on('keyup', function (e) {
            if (e.key === 'Enter') {
                $searchForm.trigger('submit');
            }
        });

        // Edición libre: no forzamos autoselección que reescriba el input
        // Si coincide exactamente, marcamos activo SIN modificar el valor del input
        $searchInput.on('input', function () {
            const term = ($(this).val() || '').trim().toLowerCase();
            const matchIndex = contacts.findIndex(c =>
                c.name.toLowerCase() === term || c.alias.toLowerCase() === term
            );

            if (matchIndex !== -1) {
                setActiveContact(matchIndex, false); // no reflejar valor para permitir borrar
            } else {
                activeIndex = null;
                $('.contact-item').removeClass('active');
                $sendBtn.addClass('d-none').hide();
            }
        });

        // Enviar solo si el valor coincide con nombre/alias de un contacto
        $searchForm.on('submit', function (e) {
            e.preventDefault();

            const term = ($searchInput.val() || '').trim().toLowerCase();
            if (!term) return;

            const index = contacts.findIndex(c =>
                c.name.toLowerCase() === term || c.alias.toLowerCase() === term
            );

            if (index !== -1) {
                setActiveContact(index, false); // no sobrescribir input
            } else {
                alert('Seleccione un contacto válido de la lista (nombre o alias).');
                $('.contact-item').removeClass('active');
                $sendBtn.addClass('d-none').hide();
                // No limpiamos el campo para permitir corregir
            }
        });
    }

    /* mostrar modal agregar contacto */
    $('#addContactBtn').click(() => $('#addContactModal').modal('show'));

    /* guardar contacto */
    $('#saveContact').click(function () {
        const name = $('#contactName').val().trim();
        const cbu = $('#contactCbu').val().trim();
        const alias = $('#contactAlias').val().trim();
        const bank = $('#contactBank').val().trim();

        if (!name || !cbu || !alias || !bank) {
            alert('Complete todos los datos requeridos');
            return;
        }

        contacts.push({ name, cbu, alias, bank });
        saveContacts();

        renderContacts();
        renderContactsDatalist();
        $('#addContactModal').modal('hide');
        $('#addContactForm')[0].reset();
    });

    /* seleccionar contacto por click en la lista (sí reflejar en input) */
    $list.on('click', '.contact-item', function () {
        const index = Number($(this).attr('data-index'));
        if (!Number.isInteger(index)) return;
        setActiveContact(index, true);
    });

    /* ===== CONTENEDOR MENSAJE CONFIRMACIÓN ===== */
    if (!$('#transferMsg').length) {
        $('.container').append('<div id="transferMsg" class="mt-3"></div>');
    }

    /* enviar dinero -> abrir modal de confirmación */
    $sendBtn.click(function () {
        const index = activeIndex;
        const amount = Number($('#transferAmount').val());

        if (!Number.isInteger(index)) return;
        if (!amount || amount <= 0) return alert('Ingrese un monto válido');
        if (amount > saldo) return alert('Saldo insuficiente');

        const contactName = contacts[index].name;
        const formattedAmount = formatCLP(amount);

        const $modal = $('#confirmTransferModal');
        if ($modal.length) {
            $('#confirmTransferText').text(`¿Desea transferir ${formattedAmount} a ${contactName}?`);
            $modal.data('transferIndex', index);
            $modal.data('transferAmount', amount);
            $modal.modal('show');
        } else {
            // Fallback si no existe el modal en el HTML
            if (confirm(`¿Desea transferir ${formattedAmount} a ${contactName}?`)) {
                performTransfer(index, amount);
            }
        }
    });

    /* confirmar transferencia desde el modal */
    $('#confirmTransferBtn').off('click').on('click', function () {
        const $modal = $('#confirmTransferModal');
        const index = $modal.data('transferIndex');
        const amount = $modal.data('transferAmount');

        if (!Number.isInteger(index)) return $modal.modal('hide');
        if (!amount || amount <= 0) return $modal.modal('hide');
        if (amount > saldo) {
            alert('Saldo insuficiente');
            return $modal.modal('hide');
        }

        performTransfer(index, amount);
        $modal.modal('hide');
    });
}


/* =====================================================
   TRANSACTIONS PAGE
===================================================== */

if ($('#transactionsPage').length) {

    const $list = $('#transactionsList');

    function mostrar(filtro = 'all') {

        $list.empty();

        let data = transactions;

        if (filtro !== 'all') {
            data = transactions.filter(t => t.type === filtro);
        }

        data
            .sort((a, b) => b.timestamp - a.timestamp)
            .forEach(t => {

                const text =
                    t.type === 'Depósito'
                        ? `Depósito + ${formatCLP(t.amount)}`
                        : `Transferencia enviada - ${formatCLP(t.amount)} a ${t.to}`;

                $list.append(`
                    <li class="list-group-item">
                        ${text}<br>
                        <small>${new Date(t.timestamp).toLocaleString()}</small>
                    </li>
                `);
            });
    }

    mostrar();

    $('#filterType').change(function () {
        mostrar($(this).val());
    });
}

// =====================================
// NAVBAR INTERACTIVO
// =====================================

// Redirección del brand (Alke Wallet)
const brand = document.getElementById('brandLink');
if (brand && !window.location.href.includes('login.html')) {
  brand.addEventListener('click', () => {
    window.location.href = 'menu.html';
  });
}

// Botón cerrar sesión
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    // sessionStorage.clear();  //
    window.location.href = 'login.html';
  });
}


/* =====================================================
   DARK MODE
===================================================== */

$('#darkToggle').click(function () {
    $('body').toggleClass('dark');
    localStorage.setItem('darkMode', $('body').hasClass('dark'));
});

});