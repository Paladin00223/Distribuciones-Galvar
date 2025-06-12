// Verificación de acceso de administrador
document.addEventListener('DOMContentLoaded', function () {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (!usuario || !usuario.esAdmin) {
        window.location.href = 'login.html';
        return;
    }

    // Mostrar nombre del administrador
    document.querySelector('.admin-titulo').textContent = `Panel de Administración - ${usuario.nombre}`;

    // Cargar pedidos al iniciar
    cargarPedidos();

    // Agregar event listeners para los filtros
    document.getElementById('buscarPedido').addEventListener('input', filtrarPedidos);
    document.getElementById('filtroEstado').addEventListener('change', filtrarPedidos);
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
document.addEventListener('DOMContentLoaded', function () {
    cargarUsuarios();
});
// Llama a cargarUsuarios al cargar la página
document.addEventListener('DOMContentLoaded', function () {
    cargarUsuarios();
});


// Función para cargar los pedidos
function cargarPedidos() {
    const pedidos = JSON.parse(localStorage.getItem('historialCompras')) || [];
    mostrarPedidos(pedidos);
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
    const pedidos = JSON.parse(localStorage.getItem('historialCompras')) || [];

    const pedidosFiltrados = pedidos.filter(pedido => {
        const coincideBusqueda = pedido.id.toLowerCase().includes(busqueda) ||
            pedido.cliente.nombre.toLowerCase().includes(busqueda);
        const coincideEstado = estadoFiltro === 'todos' || pedido.estado === estadoFiltro;

        return coincideBusqueda && coincideEstado;
    });

    mostrarPedidos(pedidosFiltrados);
}

// Función para procesar un pedido
function procesarPedido(idPedido) {
    const pedidos = JSON.parse(localStorage.getItem('historialCompras')) || [];
    const pedidoIndex = pedidos.findIndex(p => p.id === idPedido);

    if (pedidoIndex !== -1) {
        pedidos[pedidoIndex].estado = 'Procesado';
        localStorage.setItem('historialCompras', JSON.stringify(pedidos));
        cargarPedidos();
        alert('Pedido procesado exitosamente');
    }
}

// Función para cancelar un pedido
function cancelarPedido(idPedido) {
    if (confirm('¿Está seguro de que desea cancelar este pedido?')) {
        const pedidos = JSON.parse(localStorage.getItem('historialCompras')) || [];
        const pedidoIndex = pedidos.findIndex(p => p.id === idPedido);

        if (pedidoIndex !== -1) {
            pedidos[pedidoIndex].estado = 'Cancelado';
            localStorage.setItem('historialCompras', JSON.stringify(pedidos));
            cargarPedidos();
            alert('Pedido cancelado exitosamente');
        }
    }
}

// Función para ver detalles de productos
function verDetallesProductos(idPedido) {
    console.log('verDetallesProductos llamado con idPedido:', idPedido); // Debug log
    const pedidos = JSON.parse(localStorage.getItem('historialCompras')) || [];
    console.log('Historial de compras cargado:', pedidos); // Debug log
    const pedido = pedidos.find(p => p.id === idPedido);
    console.log('Pedido encontrado:', pedido); // Debug log

    if (pedido) {
        if (pedido.productos && Array.isArray(pedido.productos) && pedido.productos.length > 0) {
            const detalles = pedido.productos.map(p =>
                // Usar p.price en lugar de p.precio y verificar que sea un número
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
}


// Función para ver detalles completos del pedido
function verPedido(idPedido) {
    const pedidos = JSON.parse(localStorage.getItem('historialCompras')) || [];
    const pedido = pedidos.find(p => p.id === idPedido);

    if (pedido) {
        const detalles = `
                    ID: ${pedido.id}
                    Cliente: ${pedido.cliente.nombre}
                    Email: ${pedido.cliente.email}
                    Teléfono: ${pedido.cliente.telefono}
                    Dirección: ${pedido.cliente.direccion}
                    Fecha: ${new Date(pedido.fecha).toLocaleString('es-CO')}
                    Estado: ${pedido.estado}
                    Total: $${pedido.total.toLocaleString('es-CO')}
                    Puntos ganados: ${pedido.puntosGanados}
                `;

        alert(detalles);
    }
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