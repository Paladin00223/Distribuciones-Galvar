document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('detallesModal');
    const closeModalBtn = document.querySelector('.modal .close');
    const detallesContenido = document.getElementById('detallesContenido');
    const cancelarCompraBtn = document.getElementById('cancelarCompra');
    let currentOrderId = null;

    // --- Manejo del Modal ---
    // Abrir modal
    document.querySelectorAll('.details-btn').forEach(button => {
        button.addEventListener('click', async () => {
            currentOrderId = button.dataset.orderId;
            detallesContenido.innerHTML = '<p>Cargando detalles...</p>';
            modal.style.display = 'block';

            try {
                const response = await fetch(`/order_details/${currentOrderId}`);
                const data = await response.json();

                if (data.success) {
                    renderOrderDetails(data.order);
                } else {
                    detallesContenido.innerHTML = `<p style="color: red;">${data.message}</p>`;
                }
            } catch (error) {
                detallesContenido.innerHTML = '<p style="color: red;">Error de conexión.</p>';
            }
        });
    });

    // Cerrar modal
    closeModalBtn.onclick = () => {
        modal.style.display = 'none';
        currentOrderId = null;
    };

    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
            currentOrderId = null;
        }
    };

    // Función para renderizar los detalles en el modal
    function renderOrderDetails(order) {
        let itemsHtml = '<ul>';
        order.items.forEach(item => {
            itemsHtml += `<li>
                <span>${item.nombre} (x${item.cantidad})</span>
                <span>$${(item.precio_compra * item.cantidad).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </li>`;
        });
        itemsHtml += '</ul>';

        const shipping = order.shipping_info;
        const detailsHtml = `
            <p><strong>ID Pedido:</strong> ${order._id}</p>
            <p><strong>Fecha:</strong> ${new Date(order.order_date).toLocaleString()}</p>
            <p><strong>Total:</strong> $${order.total_amount.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            <p><strong>Estado:</strong> ${order.status}</p>
            <hr>
            <h4>Productos</h4>
            ${itemsHtml}
            <hr>
            <h4>Información de Envío</h4>
            <p><strong>Nombre:</strong> ${shipping.name}</p>
            <p><strong>Dirección:</strong> ${shipping.address}</p>
            <p><strong>Teléfono:</strong> ${shipping.phone}</p>
            <p><strong>Email:</strong> ${shipping.email}</p>
        `;
        detallesContenido.innerHTML = detailsHtml;

        // Mostrar u ocultar el botón de cancelar según el estado
        if (order.status === 'Pendiente') {
            cancelarCompraBtn.style.display = 'block';
        } else {
            cancelarCompraBtn.style.display = 'none';
        }
    }

    // --- Cancelar Compra ---
    cancelarCompraBtn.addEventListener('click', async () => {
        if (!currentOrderId) return;

        if (confirm('¿Estás seguro de que deseas cancelar esta compra? Esta acción no se puede deshacer.')) {
            try {
                const response = await fetch('/cancel_order', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ order_id: currentOrderId })
                });
                const data = await response.json();
                alert(data.message);
                if (data.success) {
                    window.location.reload(); // Recargar la página para ver el cambio de estado
                }
            } catch (error) {
                alert('Error de conexión al intentar cancelar la compra.');
            }
        }
    });

    // --- Filtros ---
    const filtroEstado = document.getElementById('filtro-estado');
    const filtroFecha = document.getElementById('filtro-fecha');

    function aplicarFiltros() {
        const estadoSeleccionado = filtroEstado.value;
        const fechaSeleccionada = filtroFecha.value;
        const filas = document.querySelectorAll('#compras-body tr');

        filas.forEach(fila => {
            const estadoFila = fila.dataset.estado;
            const fechaFila = fila.dataset.fecha;
            
            let mostrar = true;

            if (estadoSeleccionado !== 'todos' && estadoFila !== estadoSeleccionado) {
                mostrar = false;
            }

            if (fechaSeleccionada && fechaFila !== fechaSeleccionada) {
                mostrar = false;
            }

            fila.style.display = mostrar ? '' : 'none';
        });
    }

    filtroEstado.addEventListener('change', aplicarFiltros);
    filtroFecha.addEventListener('change', aplicarFiltros);

    // No se implementa "Borrar Historial" por ser una acción muy destructiva.
    // Se deja el botón por si se quiere añadir en el futuro con más medidas de seguridad.
    document.getElementById('borrarHistorial').addEventListener('click', () => {
        alert('Esta función aún no está implementada.');
    });
});