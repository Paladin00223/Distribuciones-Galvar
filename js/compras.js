let compraActual = null;

function cargarCompras() {
    const compras = JSON.parse(localStorage.getItem('historialCompras')) || [];
    const tbody = document.getElementById('compras-body');

    if (compras.length === 0) {
        tbody.innerHTML = `
                    <tr>
                        <td colspan="5">
                            <div class="no-compras">
                                <i class="fas fa-shopping-bag"></i>
                                <p>No hay compras registradas</p>
                            </div>
                        </td>
                    </tr>
                `;
        return;
    }

    tbody.innerHTML = '';
    compras.forEach(compra => {
        const row = document.createElement('tr');
        row.innerHTML = `
                    <td>${compra.id}</td>
                    <td>${new Date(compra.fecha).toLocaleDateString()}</td>
                    <td>$${compra.total.toLocaleString('es-CO')}</td>
                    <td><span class="estado-${compra.estado.toLowerCase()}">${compra.estado}</span></td>
                    <td>
                        ${compra.estado === 'Pendiente'
                ? `<button class="detalles-btn" style="background-color: #e74c3c;" onclick="cancelarCompra('${compra.id}')">
                                Cancelar Compra
                               </button>`
                : `<button class="detalles-btn" onclick="mostrarDetalles('${compra.id}')">
                                Ver Detalles
                               </button>`
            }
                    </td>
                `;
        tbody.appendChild(row);
    });
}

function mostrarDetalles(idCompra) {
    const compras = JSON.parse(localStorage.getItem('historialCompras')) || [];
    compraActual = compras.find(c => c.id === idCompra);

    if (!compraActual) return;

    const modal = document.getElementById('detallesModal');
    const contenido = document.getElementById('detallesContenido');
    const cancelarBtn = document.getElementById('cancelarCompra');

    let detallesHTML = `
                <p><strong>ID de Compra:</strong> ${compraActual.id}</p>
                <p><strong>Fecha:</strong> ${new Date(compraActual.fecha).toLocaleString()}</p>
                <p><strong>Estado:</strong> ${compraActual.estado}</p>
                <p><strong>Total:</strong> $${compraActual.total.toLocaleString('es-CO')}</p>
                <h3>Productos:</h3>
                <ul>
            `;

    compraActual.productos.forEach(producto => {
        detallesHTML += `
                    <li>
                        ${producto.name} - Cantidad: ${producto.quantity} - 
                        Precio: $${producto.price.toLocaleString('es-CO')}
                    </li>
                `;
    });

    detallesHTML += '</ul>';
    contenido.innerHTML = detallesHTML;

    // Mostrar u ocultar el botón de cancelar según el estado
    if (compraActual.estado === 'Pendiente') {
        cancelarBtn.style.display = 'block';
    } else {
        cancelarBtn.style.display = 'none';
    }

    modal.style.display = 'block';
}

function cancelarCompra(idCompra) {
    const compras = JSON.parse(localStorage.getItem('historialCompras')) || [];
    const compra = compras.find(c => c.id === idCompra);

    if (!compra) {
        alert('No se encontró la compra');
        return;
    }

    if (compra.estado !== 'Pendiente') {
        alert('Solo se pueden cancelar compras pendientes');
        return;
    }

    // Verificar si la compra está en el historial
    const fechaCompra = new Date(compra.fecha);
    const ahora = new Date();
    const diferenciaHoras = (ahora - fechaCompra) / (1000 * 60 * 60);

    if (diferenciaHoras > 24) {
        alert('No se pueden cancelar compras que tienen más de 24 horas en el historial');
        return;
    }

    if (confirm('¿Estás seguro de que deseas cancelar esta compra?')) {
        const compraIndex = compras.findIndex(c => c.id === idCompra);

        if (compraIndex !== -1) {
            compras[compraIndex].estado = 'Cancelado';
            localStorage.setItem('historialCompras', JSON.stringify(compras));

            cargarCompras();
            alert('Compra cancelada exitosamente');
        }
    }
}

// Cerrar modal
document.querySelector('.close').onclick = function () {
    document.getElementById('detallesModal').style.display = 'none';
}

// Cerrar modal al hacer clic fuera
window.onclick = function (event) {
    const modal = document.getElementById('detallesModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// Cargar compras al iniciar la página
window.onload = function () {
    cargarCompras();

    // Agregar filtros
    document.getElementById('filtro-estado').addEventListener('change', filtrarCompras);
    document.getElementById('filtro-fecha').addEventListener('change', filtrarCompras);

    // Agregar evento para borrar historial
    document.getElementById('borrarHistorial').addEventListener('click', function () {
        if (confirm('¿Estás seguro de que deseas borrar todo el historial de compras? Esta acción no se puede deshacer.')) {
            localStorage.removeItem('historialCompras');
            cargarCompras();
            alert('Historial de compras borrado exitosamente');
        }
    });
};

function filtrarCompras() {
    const estadoFiltro = document.getElementById('filtro-estado').value;
    const fechaFiltro = document.getElementById('filtro-fecha').value;
    const compras = JSON.parse(localStorage.getItem('historialCompras')) || [];
    const tbody = document.getElementById('compras-body');

    let comprasFiltradas = compras;

    if (estadoFiltro !== 'todos') {
        comprasFiltradas = comprasFiltradas.filter(c =>
            c.estado.toLowerCase() === estadoFiltro.toLowerCase()
        );
    }

    if (fechaFiltro) {
        const fechaFiltroObj = new Date(fechaFiltro);
        comprasFiltradas = comprasFiltradas.filter(c => {
            const fechaCompra = new Date(c.fecha);
            return fechaCompra.toDateString() === fechaFiltroObj.toDateString();
        });
    }

    if (comprasFiltradas.length === 0) {
        tbody.innerHTML = `
                    <tr>
                        <td colspan="5">
                            <div class="no-compras">
                                <i class="fas fa-search"></i>
                                <p>No se encontraron compras con los filtros seleccionados</p>
                            </div>
                        </td>
                    </tr>
                `;
        return;
    }

    tbody.innerHTML = '';
    comprasFiltradas.forEach(compra => {
        const row = document.createElement('tr');
        row.innerHTML = `
                    <td>${compra.id}</td>
                    <td>${new Date(compra.fecha).toLocaleDateString()}</td>
                    <td>$${compra.total.toLocaleString('es-CO')}</td>
                    <td><span class="estado-${compra.estado.toLowerCase()}">${compra.estado}</span></td>
                    <td>
                        ${compra.estado === 'Pendiente'
                ? `<button class="detalles-btn" style="background-color: #e74c3c;" onclick="cancelarCompra('${compra.id}')">
                                Cancelar Compra
                               </button>`
                : `<button class="detalles-btn" onclick="mostrarDetalles('${compra.id}')">
                                Ver Detalles
                               </button>`
            }
                    </td>
                `;
        tbody.appendChild(row);
    });
}