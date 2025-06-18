// Cargar todos los retiros
function loadRetiros() {
    fetch('http://localhost:5000/retiros')
        .then(response => response.json())
        .then(allRetiros => {
            // Ordenar por fecha (más reciente primero)
            allRetiros.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
            displayRetiros(allRetiros);
        })
        .catch(error => {
            console.error('Error al cargar los retiros:', error);
            displayRetiros([]);
        });
}

// Mostrar retiros en la tabla
function displayRetiros(retiros) {
    const container = document.getElementById('retiros-table-container');

    if (retiros.length === 0) {
        container.innerHTML = `
                    <div class="no-retiros">
                        <i class="fas fa-history"></i>
                        <p>No hay retiros registrados</p>
                    </div>
                `;
        return;
    }

    const table = `
                <table class="retiros-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Fecha</th>
                            <th>Usuario</th>
                            <th>Puntos</th>
                            <th>Valor</th>
                            <th>Banco</th>
                            <th>Cuenta</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${retiros.map(retiro => `
                            <tr>
                                <td>${retiro.id}</td>
                                <td>${new Date(retiro.fecha).toLocaleDateString()}</td>
                                <td>${retiro.usuario}</td>
                                <td>${retiro.puntos}</td>
                                <td>$${retiro.valor.toLocaleString('es-CO')}</td>
                                <td>${retiro.banco}</td>
                                <td>${retiro.cuenta}</td>
                                <td class="status-${retiro.estado.toLowerCase()}">${retiro.estado}</td>
                                <td>
                                    ${retiro.estado === 'Pendiente' ? `
                                        <button class="action-btn approve-btn" onclick="updateStatus('${retiro.id}', 'Completado')">
                                            Aprobar
                                        </button>
                                        <button class="action-btn reject-btn" onclick="updateStatus('${retiro.id}', 'Rechazado')">
                                            Rechazar
                                        </button>
                                    ` : ''}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;

    container.innerHTML = table;
}

// Aplicar filtros
function applyFilters() {
    const statusFilter = document.getElementById('status-filter').value;
    const dateFilter = document.getElementById('date-filter').value;

    fetch('http://localhost:5000/retiros')
        .then(response => response.json())
        .then(retiros => {
            let filteredRetiros = retiros.filter(retiro => {
                const retiroDate = new Date(retiro.fecha).toLocaleDateString();
                const matchesStatus = statusFilter === 'todos' || retiro.estado === statusFilter;
                const matchesDate = !dateFilter || retiroDate === new Date(dateFilter).toLocaleDateString();
                return matchesStatus && matchesDate;
            });

            filteredRetiros.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
            displayRetiros(filteredRetiros);
        })
        .catch(error => {
            console.error('Error al filtrar los retiros:', error);
            displayRetiros([]);
        });
}
// Actualizar estado de un retiro
function updateStatus(retiroId, newStatus) {
    fetch(`http://localhost:5000/retiros/${retiroId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: newStatus })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'ok') {
            loadRetiros();
            alert(`Estado actualizado a: ${newStatus}`);
        } else {
            alert('No se pudo actualizar el estado del retiro');
        }
    })
    .catch(error => {
        console.error('Error al actualizar el estado del retiro:', error);
        alert('Error al actualizar el estado del retiro');
    });
}

// Cargar retiros al iniciar la página
window.onload = loadRetiros;