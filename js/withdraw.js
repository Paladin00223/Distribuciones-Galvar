// Cargar puntos disponibles
function loadPoints(emailUsuario) {
    fetch(`http://localhost:5000/usuarios?email=${encodeURIComponent(emailUsuario)}`)
        .then(response => response.json())
        .then(usuarios => {
            const user = Array.isArray(usuarios) ? usuarios[0] : usuarios || {};
            const points = user.puntos || 0;
            document.getElementById('available-points').textContent = points;
        })
        .catch(error => {
            console.error('Error al cargar los puntos:', error);
            document.getElementById('available-points').textContent = '0';
        });
}

// Cargar historial de retiros
function loadWithdrawHistory(emailUsuario) {
    const historyContainer = document.getElementById('withdraw-history');

    fetch(`http://localhost:5000/retiros?email=${encodeURIComponent(emailUsuario)}`)
        .then(response => response.json())
        .then(history => {
            if (!history || history.length === 0) {
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
                    <td>${retiro.fecha ? new Date(retiro.fecha).toLocaleDateString() : ''}</td>
                    <td>${retiro.puntos || 0}</td>
                    <td>$${retiro.puntos ? retiro.puntos.toLocaleString('es-CO') : '0'}</td>
                    <td class="status-${retiro.estado ? retiro.estado.toLowerCase() : ''}">${retiro.estado || ''}</td>
                </tr>
            `).join('');
        })
        .catch(error => {
            console.error('Error al cargar el historial de retiros:', error);
            historyContainer.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; padding: 20px;">
                        Error al cargar el historial de retiros
                    </td>
                </tr>
            `;
        });
}

// Solicitar retiro
function requestWithdraw(emailUsuario) {
    const points = parseInt(document.getElementById('points').value);
    const bank = document.getElementById('bank').value;
    const account = document.getElementById('account').value;
    const accountType = document.getElementById('account-type').value;

    if (!points || !bank || !account) {
        alert('Por favor complete todos los campos');
        return;
    }

    // Obtener usuario actual del backend
    fetch(`http://localhost:5000/usuarios?email=${encodeURIComponent(emailUsuario)}`)
        .then(response => response.json())
        .then(usuarios => {
            const user = Array.isArray(usuarios) ? usuarios[0] : usuarios;
            if (!user) {
                alert('No se encontró el usuario');
                return;
            }

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
                tipoCuenta: accountType,
                usuarioId: user.id
            };

            // Registrar el retiro en el backend
            fetch('http://localhost:5000/retiros', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(retiro)
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'ok') {
                    // Actualizar puntos del usuario en el backend
                    fetch(`http://localhost:5000/usuarios/${user.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ puntos: user.puntos - points })
                    })
                    .then(() => {
                        loadPoints(emailUsuario);
                        loadWithdrawHistory(emailUsuario);

                        // Limpiar formulario
                        document.getElementById('points').value = '';
                        document.getElementById('bank').value = '';
                        document.getElementById('account').value = '';
                        document.getElementById('account-type').value = 'ahorros';

                        alert('Solicitud de retiro enviada correctamente');
                    });
                } else {
                    alert('No se pudo registrar el retiro');
                }
            })
            .catch(() => {
                alert('Error al registrar el retiro');
            });
        })
        .catch(() => {
            alert('Error al obtener el usuario');
        });
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
function cargarUsuario(emailUsuario) {
    if (!emailUsuario) return;

    fetch(`http://localhost:5000/usuarios?email=${encodeURIComponent(emailUsuario)}`)
        .then(response => response.json())
        .then(usuarios => {
            const usuario = Array.isArray(usuarios) ? usuarios[0] : usuarios;
            if (usuario) {
                actualizarPuntosUsuario(emailUsuario); // Actualizar puntos al cargar usuario
            }
        })
        .catch(error => {
            console.error('Error al cargar el usuario:', error);
        });
}

// Inicializar
cargarUsuario();

// Actualizar puntos cada 30 segundos
setInterval(actualizarPuntosUsuario, 30000);