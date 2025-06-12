// Cargar todos los retiros
        function loadRetiros() {
            const users = JSON.parse(localStorage.getItem('users')) || [];
            let allRetiros = [];

            // Recolectar retiros de todos los usuarios
            users.forEach(user => {
                if (user.retiros && user.retiros.length > 0) {
                    user.retiros.forEach(retiro => {
                        allRetiros.push({
                            ...retiro,
                            usuario: user.nombre,
                            email: user.email
                        });
                    });
                }
            });

            // Ordenar por fecha (más reciente primero)
            allRetiros.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

            displayRetiros(allRetiros);
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

            const users = JSON.parse(localStorage.getItem('users')) || [];
            let filteredRetiros = [];

            users.forEach(user => {
                if (user.retiros && user.retiros.length > 0) {
                    user.retiros.forEach(retiro => {
                        const retiroDate = new Date(retiro.fecha).toLocaleDateString();
                        const matchesStatus = statusFilter === 'todos' || retiro.estado === statusFilter;
                        const matchesDate = !dateFilter || retiroDate === new Date(dateFilter).toLocaleDateString();

                        if (matchesStatus && matchesDate) {
                            filteredRetiros.push({
                                ...retiro,
                                usuario: user.nombre,
                                email: user.email
                            });
                        }
                    });
                }
            });

            filteredRetiros.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
            displayRetiros(filteredRetiros);
        }

        // Actualizar estado de un retiro
        function updateStatus(retiroId, newStatus) {
            const users = JSON.parse(localStorage.getItem('users')) || [];
            let updated = false;

            users.forEach(user => {
                if (user.retiros) {
                    user.retiros.forEach(retiro => {
                        if (retiro.id === retiroId) {
                            retiro.estado = newStatus;
                            updated = true;
                        }
                    });
                }
            });

            if (updated) {
                localStorage.setItem('users', JSON.stringify(users));
                loadRetiros();
                alert(`Estado actualizado a: ${newStatus}`);
            }
        }

        // Cargar retiros al iniciar la página
        window.onload = loadRetiros;