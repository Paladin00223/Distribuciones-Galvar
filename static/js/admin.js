document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.admin-tab');
    const tabContents = document.querySelectorAll('.tab-content');

    // --- Lógica para cambiar de pestaña ---
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Ocultar todo el contenido y desactivar todas las pestañas
            tabs.forEach(t => t.classList.remove('activo'));
            tabContents.forEach(c => c.style.display = 'none');

            // Activar la pestaña y el contenido seleccionados
            tab.classList.add('activo');
            const tabName = tab.dataset.tab;
            document.getElementById(`${tabName}-content`).style.display = 'block';

            // Cargar el contenido correspondiente a la pestaña
            if (tabName === 'usuarios') {
                loadUsers();
            } else if (tabName === 'pedidos') {
                loadOrders();
            }
        });
    });

    // --- Lógica para la pestaña de Usuarios ---
    async function loadUsers() {
        const tableBody = document.getElementById('usuarios-tabla');
        tableBody.innerHTML = '<tr><td colspan="9">Cargando usuarios...</td></tr>';
        try {
            // Usamos la ruta API /usuarios que ya tenías en app.py
            const response = await fetch('/usuarios');
            const users = await response.json();
            renderUsersTable(users);
        } catch (error) {
            tableBody.innerHTML = '<tr><td colspan="9" style="color:red;">Error al cargar usuarios.</td></tr>';
            console.error('Error loading users:', error);
        }
    }

    function renderUsersTable(users) {
        const tableBody = document.getElementById('usuarios-tabla');
        tableBody.innerHTML = '';
        if (users.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="9">No se encontraron usuarios.</td></tr>';
            return;
        }
        users.forEach(user => {
            const row = `
                <tr>
                    <td>${user._id.slice(-6)}...</td>
                    <td>${user.nombre || 'N/A'}</td>
                    <td>${user.email || 'N/A'}</td>
                    <td>${user.cedula || 'N/A'}</td>
                    <td>${user.documento || 'N/A'}</td>
                    <td>${user.paquete || 'N/A'}</td>
                    <td>${user.puntos || 0}</td>
                    <td>${user.estado || 'N/A'}</td>
                    <td><button class="btn-edit">Editar</button></td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    }

    // --- Lógica para la pestaña de Pedidos ---
    async function loadOrders() {
        const tableBody = document.getElementById('pedidos-tabla');
        tableBody.innerHTML = '<tr><td colspan="8">Cargando pedidos...</td></tr>';
        try {
            // Usamos la nueva ruta API que creamos
            const response = await fetch('/api/admin/orders');
            const orders = await response.json();
            renderOrdersTable(orders);
        } catch (error) {
            tableBody.innerHTML = '<tr><td colspan="8" style="color:red;">Error al cargar pedidos.</td></tr>';
            console.error('Error loading orders:', error);
        }
    }

    function renderOrdersTable(orders) {
        const tableBody = document.getElementById('pedidos-tabla');
        tableBody.innerHTML = '';
        if (orders.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="8">No se encontraron pedidos.</td></tr>';
            return;
        }
        orders.forEach(order => {
            const customerName = order.customer_info ? order.customer_info.nombre : (order.shipping_info.name || 'N/A');
            const row = `
                <tr>
                    <td>${order._id.slice(-8)}...</td>
                    <td>${customerName}</td>
                    <td>${order.items.length} producto(s)</td>
                    <td>${order.shipping_info.address}</td>
                    <td>$${order.total_amount.toFixed(2)}</td>
                    <td>${new Date(order.order_date).toLocaleString()}</td>
                    <td>${order.status}</td>
                    <td><button class="btn-details">Detalles</button></td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    }

    // Cargar la primera pestaña ("Usuarios") por defecto al entrar a la página
    loadUsers();
});