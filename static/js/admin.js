// c:\Users\USUARIO\Desktop\GitHub\Distritiendas Galvar\static\js\admin.js

document.addEventListener('DOMContentLoaded', () => {
    const adminTabs = document.querySelectorAll('.admin-tab');
    const tabContents = document.querySelectorAll('.tab-content');

    // Función para mostrar el contenido del tab seleccionado
    const showTabContent = (tabName) => {
        tabContents.forEach(content => {
            if (content.id === `${tabName}-content`) {
                content.style.display = 'block';
            } else {
                content.style.display = 'none';
            }
        });
    };

    // Función para activar el botón del tab
    const activateTabButton = (button) => {
        adminTabs.forEach(tab => tab.classList.remove('activo'));
        button.classList.add('activo');
    };

    // Event listeners para los botones de los tabs
    adminTabs.forEach(tabButton => {
        tabButton.addEventListener('click', () => {
            const tabName = tabButton.dataset.tab;
            activateTabButton(tabButton);
            showTabContent(tabName);

            // Aquí es donde llamarías a las funciones para cargar los datos
            // según el tab seleccionado
            if (tabName === 'usuarios') {
                loadUsers();
            } else if (tabName === 'pedidos') {
                loadOrders();
            } else if (tabName === 'retiros') {
                loadWithdrawals();
            }
        });
    });

    // --- Funciones de carga de datos (ejemplos conceptuales) ---

    // Cargar usuarios
    const loadUsers = async () => {
        // Obtener el ID del administrador que ha iniciado sesión desde el atributo data del body
        const loggedInUserId = document.body.dataset.userId;

        try {
            // Realiza la llamada a la API de Flask para obtener los usuarios
            const response = await fetch('/api/admin/users');
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            const users = await response.json();

            const usersTableBody = document.getElementById('usuarios-tabla');
            usersTableBody.innerHTML = ''; // Limpiar tabla antes de añadir nuevos datos

            if (users.length === 0) {
                usersTableBody.innerHTML = '<tr><td colspan="9" style="text-align: center;">No se encontraron usuarios.</td></tr>';
                return;
            }

            users.forEach(user => {
                const row = usersTableBody.insertRow();
                // Condición para mostrar el botón de eliminar: solo si el ID del usuario en la fila
                // es diferente al ID numérico (uid) del administrador que ha iniciado sesión.
                const deleteButtonHtml = user.uid.toString() !== loggedInUserId ? `<button class="btn-accion eliminar" data-id="${user.uid}">Eliminar</button>` : '';
                // Usamos los campos de la base de datos (MongoDB)
                // y usamos '||' para mostrar 'N/A' si un campo opcional no existe.
                row.innerHTML = `
                    <td>${user.uid}</td>
                    <td>${user.nombre || 'N/A'}</td>
                    <td>${user.email || 'N/A'}</td>
                    <td>${user.cedula || 'N/A'}</td>
                    <td>${user.documento ? `<a href="/uploads/${user.documento}" target="_blank">Ver</a>` : 'N/A'}</td>
                    <td>${user.paquete || 'N/A'}</td>
                    <td>${user.puntos || 0}</td>
                    <td>${user.estado || 'N/A'}</td>
                    <td>
                        <button class="btn-accion editar" data-id="${user.uid}">Editar</button>
                        ${deleteButtonHtml}
                    </td>
                `;
            });
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
        }
    };

    // Cargar pedidos
    const loadOrders = async () => {
        try {
            // Realiza la llamada a la API de Flask para obtener los pedidos
            const response = await fetch('/api/admin/orders');
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status}`);
            }
            const orders = await response.json();

            const ordersTableBody = document.getElementById('pedidos-tabla');
            ordersTableBody.innerHTML = '';

            if (orders.length === 0) {
                ordersTableBody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No se encontraron pedidos.</td></tr>';
                return;
            }

            orders.forEach(order => {
                const row = ordersTableBody.insertRow();
                // Extraer y formatear los datos del pedido para mostrarlos en la tabla
                const customerName = order.customer_info ? order.customer_info.nombre : 'Usuario no encontrado';
                const productNames = order.items.map(item => `${item.nombre} (x${item.cantidad})`).join('<br>');
                const shippingAddress = order.shipping_info ? order.shipping_info.address : 'N/A';
                const orderDate = new Date(order.order_date).toLocaleDateString('es-ES');

                row.innerHTML = `
                    <td>${order._id}</td>
                    <td>${customerName}</td>
                    <td>${productNames}</td>
                    <td>${shippingAddress}</td>
                    <td>$${order.total_amount.toFixed(2)}</td>
                    <td>${orderDate}</td>
                    <td>${order.estado}</td>
                    <td>
                        <button class="btn-accion ver" data-id="${order._id}">Ver Detalles</button>
                        <button class="btn-accion cambiar-estado" data-id="${order._id}">Cambiar Estado</button>
                    </td>
                `;
            });
        } catch (error) {
            console.error('Error al cargar pedidos:', error);
        }
    };

    // Cargar retiros
    const loadWithdrawals = async () => {
        try {
            // TODO: Implementar la llamada a la API cuando la ruta para retiros esté disponible en app.py
            // const response = await fetch('/api/admin/withdrawals');
            // const withdrawals = await response.json();
            
            // Por ahora, se muestra un mensaje indicando que la función no está implementada
            const withdrawals = []; // Array vacío por ahora

            const withdrawalsTableBody = document.getElementById('retiros-body');
            withdrawalsTableBody.innerHTML = '';

            if (withdrawals.length === 0) {
                withdrawalsTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No hay retiros para mostrar (función no implementada).</td></tr>';
                return;
            }
            // El código para renderizar los retiros iría aquí cuando se implemente
        } catch (error) {
            console.error('Error al cargar retiros:', error);
        }
    };

    // Función para eliminar un usuario
    const deleteUser = async (userId) => {
        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'DELETE'
            });
            const result = await response.json();

            if (response.ok && result.success) {
                alert(result.message); // O usar una notificación más elegante
                loadUsers(); // Recargar la lista de usuarios
            } else {
                throw new Error(result.message || 'Error desconocido al eliminar.');
            }
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            alert(`No se pudo eliminar el usuario: ${error.message}`);
        }
    };

    // --- Lógica para el Modal de Edición ---
    const modal = document.getElementById('edit-user-modal');
    const closeModalButton = document.querySelector('.close-button');
    const editForm = document.getElementById('edit-user-form');

    // Función para abrir el modal y cargar los datos del usuario
    const openEditModal = async (userId) => {
        try {
            const response = await fetch(`/api/admin/users/${userId}`);
            if (!response.ok) {
                throw new Error('No se pudieron cargar los datos del usuario.');
            }
            const user = await response.json();

            // Llenar el formulario con los datos del usuario
            document.getElementById('edit-user-id').value = user.uid;
            document.getElementById('edit-user-name').value = user.nombre || '';
            document.getElementById('edit-user-email').value = user.email || '';
            document.getElementById('edit-user-cedula').value = user.cedula || '';
            document.getElementById('edit-user-paquete').value = user.paquete || '';
            document.getElementById('edit-user-puntos').value = user.puntos || 0;
            document.getElementById('edit-user-estado').value = user.estado || 'activo';
            document.getElementById('edit-user-tipo').value = user.tipo || 'usuario';

            modal.style.display = 'block';
        } catch (error) {
            console.error('Error al abrir modal de edición:', error);
            alert(error.message);
        }
    };

    // Función para cerrar el modal
    const closeEditModal = () => {
        modal.style.display = 'none';
    };

    // Event listener para el botón de cerrar
    closeModalButton.addEventListener('click', closeEditModal);

    // Event listener para cerrar el modal si se hace clic fuera de él
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeEditModal();
        }
    });

    // Event listener para el envío del formulario de edición
    editForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const userId = document.getElementById('edit-user-id').value;
        const formData = new FormData(editForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            const result = await response.json();
            if (!result.success) throw new Error(result.message);
            
            alert('Usuario actualizado con éxito');
            closeEditModal();
            loadUsers(); // Recargar la tabla de usuarios
        } catch (error) {
            alert(`Error al actualizar: ${error.message}`);
        }
    });

    // Inicializar: mostrar el primer tab (Usuarios) y cargar sus datos al cargar la página
    const initialTabButton = document.querySelector('.admin-tab.activo');
    if (initialTabButton) {
        showTabContent(initialTabButton.dataset.tab);
        loadUsers(); // Cargar usuarios al inicio
    }

    // --- Lógica para filtros y acciones de tabla (ejemplos conceptuales) ---

    // Filtro de usuarios (ejemplo básico)
    const userSearchInput = document.querySelector('#usuarios-content .filtro-input');
    if (userSearchInput) {
        userSearchInput.addEventListener('input', (event) => {
            const searchTerm = event.target.value.toLowerCase();
            const rows = document.querySelectorAll('#usuarios-tabla tr');
            rows.forEach(row => {
                const textContent = row.textContent.toLowerCase();
                if (textContent.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }

    // Filtro de pedidos por estado (ejemplo básico)
    const orderStatusFilter = document.getElementById('filtroEstado');
    if (orderStatusFilter) {
        orderStatusFilter.addEventListener('change', () => {
            const selectedStatus = orderStatusFilter.value;
            const rows = document.querySelectorAll('#pedidos-tabla tr');
            rows.forEach(row => {
                const statusCell = row.cells[6]; // Asumiendo que el estado está en la 7ma columna (índice 6)
                if (statusCell) {
                    if (selectedStatus === 'todos' || statusCell.textContent === selectedStatus) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                }
            });
        });
    }

    // Delegación de eventos para botones de acción en tablas (ejemplo)
    document.addEventListener('click', (event) => {
        const target = event.target;
        if (target.classList.contains('btn-accion')) {
            const id = event.target.dataset.id;

            // Lógica para el botón de editar
            if (target.classList.contains('editar')) {
                openEditModal(id);
            } 
            // Lógica para el botón de eliminar
            else if (target.classList.contains('eliminar')) {
                if (confirm(`¿Estás seguro de que deseas eliminar al usuario con ID: ${id}? Esta acción no se puede deshacer.`)) {
                    deleteUser(id);
                }
            }
        }
    });
});