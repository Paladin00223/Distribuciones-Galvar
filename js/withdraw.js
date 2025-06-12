// Cargar puntos disponibles
function loadPoints() {
    const user = JSON.parse(localStorage.getItem('currentUser')) || {};
    const points = user.puntos || 0;
    document.getElementById('available-points').textContent = points;
}

// Cargar historial de retiros
function loadWithdrawHistory() {
    const user = JSON.parse(localStorage.getItem('currentUser')) || {};
    const history = user.retiros || [];
    const historyContainer = document.getElementById('withdraw-history');

    if (history.length === 0) {
        historyContainer.innerHTML = `
                    <tr>
                        <td colspan="4" style="text-align: center; padding: 20px;">
                            No hay historial de retiros
                        </td>
                    </tr>
                `;
        return;
    }

    historyContainer.innerHTML = history.map(retiro => `
                <tr>
                    <td>${new Date(retiro.fecha).toLocaleDateString()}</td>
                    <td>${retiro.puntos}</td>
                    <td>$${retiro.puntos.toLocaleString('es-CO')}</td>
                    <td class="status-${retiro.estado.toLowerCase()}">${retiro.estado}</td>
                </tr>
            `).join('');
}

// Solicitar retiro
function requestWithdraw() {
    const points = parseInt(document.getElementById('points').value);
    const bank = document.getElementById('bank').value;
    const account = document.getElementById('account').value;
    const accountType = document.getElementById('account-type').value;

    if (!points || !bank || !account) {
        alert('Por favor complete todos los campos');
        return;
    }

    const user = JSON.parse(localStorage.getItem('currentUser')) || {};
    if (points > user.puntos) {
        alert('No tiene suficientes puntos para realizar este retiro');
        return;
    }

    const retiro = {
        id: 'RET-' + Date.now(),
        fecha: new Date().toISOString(),
        puntos: points,
        valor: points,
        estado: 'Pendiente',
        banco: bank,
        cuenta: account,
        tipoCuenta: accountType
    };

    // Actualizar historial de retiros
    user.retiros = user.retiros || [];
    user.retiros.push(retiro);

    // Actualizar puntos disponibles
    user.puntos -= points;

    // Guardar cambios
    localStorage.setItem('currentUser', JSON.stringify(user));

    // Actualizar interfaz
    loadPoints();
    loadWithdrawHistory();

    // Limpiar formulario
    document.getElementById('points').value = '';
    document.getElementById('bank').value = '';
    document.getElementById('account').value = '';
    document.getElementById('account-type').value = 'ahorros';

    alert('Solicitud de retiro enviada correctamente');
}

// Cargar datos al iniciar la página
window.onload = () => {
    loadPoints();
    loadWithdrawHistory();
};

// Función para actualizar los puntos del usuario en la interfaz
function actualizarPuntosUsuario() {
    const puntosElement = document.getElementById('puntos-usuario');
    if (puntosElement && usuario) {
        puntosElement.textContent = usuario.puntos.toLocaleString('es-CO');
    }
}

// Función para cargar el usuario
function cargarUsuario() {
    const usuarioStr = localStorage.getItem('usuario');
    if (usuarioStr) {
        usuario = JSON.parse(usuarioStr);
        actualizarPuntosUsuario(); // Actualizar puntos al cargar usuario
    }
}

// Inicializar
cargarUsuario();

// Actualizar puntos cada 30 segundos
setInterval(actualizarPuntosUsuario, 30000);