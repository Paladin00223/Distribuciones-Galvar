// Verificación de acceso de administrador
document.addEventListener('DOMContentLoaded', function () {
    // Pide al backend la lista de usuarios
    fetch('http://localhost:5000/usuarios')
        .then(response => response.json())
        .then(usuarios => {
            // Busca el usuario administrador por email (ajusta el email según tu sistema)
            const admin = usuarios.find(u => u.email === 'jdvargas223@gmail.com' && u.esAdmin);

            if (!admin) {
                // Si no hay admin, redirige al login
                window.location.href = 'login.html';
                return;
            }

            // Mostrar nombre del administrador
            document.querySelector('.admin-titulo').textContent = `Panel de Administración - ${admin.nombre}`;

            // Cargar pedidos y usuarios
            cargarPedidos();
            cargarUsuarios();

            // Agregar event listeners para los filtros
            document.getElementById('buscarPedido').addEventListener('input', filtrarPedidos);
            document.getElementById('filtroEstado').addEventListener('change', filtrarPedidos);
        })
        .catch(error => {
            console.error('Error al obtener usuarios:', error);
            window.location.href = 'login.html';
        });
});

// Función para cargar los usuarios
function cargarUsuarios() {
    fetch('http://localhost:5000/usuarios')
        .then(response => response.json())
        .then(usuarios => {
            const tbody = document.getElementById('usuarios-tabla');
            if (!tbody) return;
            if (usuarios.length === 0) {
                tbody.innerHTML = `<tr><td colspan="9" class="sin-registros">No hay usuarios registrados.</td></tr>`;
                return;
            }
            tbody.innerHTML = usuarios.map(usuario => `
                <tr>
                    <td>${usuario.id || ''}</td>
                    <td>${usuario.nombre || ''}</td>
                    <td>${usuario.email || ''}</td>
                    <td>${usuario.cedula || ''}</td>
                    <td>
                        ${usuario.documento ? `<a href="${usuario.documento}" target="_blank">Ver documento</a>` : ''}
                    </td>
                    <td>${usuario.paquete || ''}</td>
                    <td>${usuario.puntos != null ? usuario.puntos : ''}</td>
                    <td>${usuario.estado || ''}</td>
                    <td>
                        ${usuario.estado !== 'aprobado' ? `<button onclick="aprobarUsuario(${usuario.id})">Aprobar</button>` : ''}
                    </td>
                </tr>
            `).join('');
        });
}
function aprobarUsuario(id) {
    fetch(`http://localhost:5000/usuarios/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'aprobado' })
    })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'ok') {
                alert('Usuario aprobado');
                cargarUsuarios();
            } else {
                alert('Error al aprobar usuario');
            }
        });
}


// Función para cargar los pedidos
function cargarPedidos() {
    fetch('http://localhost:5000/pedidos')
        .then(response => response.json())
        .then(pedidos => {
            mostrarPedidos(pedidos);
        })
        .catch(error => {
            console.error('Error al obtener pedidos:', error);
            mostrarPedidos([]); // Opcional: muestra vacío si hay error
        });
}

// Función para mostrar los pedidos en la tabla
function mostrarPedidos(pedidos) {
    const tbody = document.getElementById('pedidos-tabla');
    tbody.innerHTML = pedidos.map(pedido => `
                <tr>
                    <td>${pedido.id}</td>
                    <td>${pedido.cliente.nombre}</td>
                    <td>
                        <button class="btn-accion btn-ver" onclick="verDetallesProductos('${pedido.id}')">
                            <i class="fas fa-box"></i> Ver productos
                        </button>
                    </td>
                    <td>${pedido.cliente.direccion}</td>
                    <td>$${pedido.total.toLocaleString('es-CO')}</td>
                    <td>${new Date(pedido.fecha).toLocaleDateString('es-CO')}</td>
                    <td>
                        <span class="estado-pedido ${obtenerClaseEstado(pedido.estado)}">
                            ${pedido.estado}
                        </span>
                    </td>
                    <td>
                        ${pedido.estado === 'Pendiente' ? `
                            <button class="btn-accion btn-editar" onclick="procesarPedido('${pedido.id}')">
                                <i class="fas fa-check"></i> Procesar
                            </button>
                            <button class="btn-accion btn-eliminar" onclick="cancelarPedido('${pedido.id}')">
                                <i class="fas fa-times"></i> Cancelar
                            </button>
                        ` : ''}
                        <button class="btn-accion btn-ver" onclick="verPedido('${pedido.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
}

// Función para filtrar pedidos
function filtrarPedidos() {
    const busqueda = document.getElementById('buscarPedido').value.toLowerCase();
    const estadoFiltro = document.getElementById('filtroEstado').value;

    fetch('http://localhost:5000/pedidos')
        .then(response => response.json())
        .then(pedidos => {
            const pedidosFiltrados = pedidos.filter(pedido => {
                const coincideBusqueda =
                    pedido.id.toString().toLowerCase().includes(busqueda) ||
                    (pedido.cliente && pedido.cliente.nombre && pedido.cliente.nombre.toLowerCase().includes(busqueda));
                const coincideEstado = estadoFiltro === 'todos' || pedido.estado === estadoFiltro;
                return coincideBusqueda && coincideEstado;
            });

            mostrarPedidos(pedidosFiltrados);
        })
        .catch(error => {
            console.error('Error al filtrar pedidos:', error);
            mostrarPedidos([]);
        });
}

// Función para procesar un pedido
function procesarPedido(idPedido) {
    fetch(`http://localhost:5000/pedidos/${idPedido}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'Procesado' })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'ok') {
            cargarPedidos();
            alert('Pedido procesado exitosamente');
        } else {
            alert('No se pudo procesar el pedido');
        }
    })
    .catch(error => {
        console.error('Error al procesar el pedido:', error);
        alert('Error al procesar el pedido');
    });
}

// Función para cancelar un pedido
function cancelarPedido(idPedido) {
    if (confirm('¿Está seguro de que desea cancelar este pedido?')) {
        fetch(`http://localhost:5000/pedidos/${idPedido}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: 'Cancelado' })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'ok') {
                cargarPedidos();
                alert('Pedido cancelado exitosamente');
            } else {
                alert('No se pudo cancelar el pedido');
            }
        })
        .catch(error => {
            console.error('Error al cancelar el pedido:', error);
            alert('Error al cancelar el pedido');
        });
    }
}

// Función para ver detalles de productos
function verDetallesProductos(idPedido) {
    console.log('verDetallesProductos llamado con idPedido:', idPedido); // Debug log

    fetch(`http://localhost:5000/pedidos/${idPedido}`)
        .then(response => response.json())
        .then(pedido => {
            console.log('Pedido encontrado:', pedido); // Debug log

            if (pedido) {
                if (pedido.productos && Array.isArray(pedido.productos) && pedido.productos.length > 0) {
                    const detalles = pedido.productos.map(p =>
                        `${p.name} - Cantidad: ${p.quantity} - Precio: $${(typeof p.price === 'number' ? p.price.toLocaleString('es-CO') : 'N/A')}`
                    ).join('\n');

                    console.log('Detalles generados:', detalles); // Debug log
                    alert(`Detalles del pedido ${idPedido}:\n\n${detalles}`);
                } else {
                    console.warn('Pedido encontrado pero sin productos:', pedido); // Debug log
                    alert(`El pedido ${idPedido} no tiene productos registrados.`);
                }
            } else {
                console.error('Pedido no encontrado con ID:', idPedido); // Debug log
                alert(`No se encontró el pedido con ID ${idPedido}.`);
            }
        })
        .catch(error => {
            console.error('Error al obtener el pedido:', error);
            alert('Error al obtener los detalles del pedido.');
        });
}


// Función para ver detalles completos del pedido
function verPedido(idPedido) {
    fetch(`http://localhost:5000/pedidos/${idPedido}`)
        .then(response => response.json())
        .then(pedido => {
            if (pedido) {
                const detalles = `
ID: ${pedido.id}
Cliente: ${pedido.cliente?.nombre || ''}
Email: ${pedido.cliente?.email || ''}
Teléfono: ${pedido.cliente?.telefono || ''}
Dirección: ${pedido.cliente?.direccion || ''}
Fecha: ${pedido.fecha ? new Date(pedido.fecha).toLocaleString('es-CO') : ''}
Estado: ${pedido.estado}
Total: $${pedido.total ? pedido.total.toLocaleString('es-CO') : '0'}
Puntos ganados: ${pedido.puntosGanados || 0}
                `;
                alert(detalles);
            } else {
                alert('No se encontró el pedido con ese ID.');
            }
        })
        .catch(error => {
            console.error('Error al obtener el pedido:', error);
            alert('Error al obtener los detalles del pedido.');
        });
}

// Función para obtener la clase CSS según el estado
function obtenerClaseEstado(estado) {
    switch (estado) {
        case 'Pendiente': return 'estado-pendiente';
        case 'Procesado': return 'estado-completado';
        case 'Cancelado': return 'estado-cancelado';
        default: return '';
    }
}

// Manejo de pestañas
document.querySelectorAll('.admin-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        // Remover clase activo de todas las pestañas
        document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('activo'));
        // Agregar clase activo a la pestaña clickeada
        tab.classList.add('activo');

        // Ocultar todos los contenidos
        document.querySelectorAll('.tab-content').forEach(content => content.style.display = 'none');
        // Mostrar el contenido correspondiente
        document.getElementById(`${tab.dataset.tab}-content`).style.display = 'block';
    });
});