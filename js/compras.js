let compraActual = null;

function cargarCompras(emailUsuario) {
    const tbody = document.getElementById('compras-body');

    fetch(`http://localhost:5000/pedidos?email=${encodeURIComponent(emailUsuario)}`)
        .then(response => response.json())
        .then(compras => {
            if (!compras || compras.length === 0) {
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
                    <td>${compra.fecha ? new Date(compra.fecha).toLocaleDateString() : ''}</td>
                    <td>$${compra.total ? compra.total.toLocaleString('es-CO') : '0'}</td>
                    <td><span class="estado-${compra.estado ? compra.estado.toLowerCase() : ''}">${compra.estado || ''}</span></td>
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
        })
        .catch(error => {
            console.error('Error al cargar las compras:', error);
            tbody.innerHTML = `
                <tr>
                    <td colspan="5">
                        <div class="no-compras">
                            <i class="fas fa-shopping-bag"></i>
                            <p>Error al cargar las compras</p>
                        </div>
                    </td>
                </tr>
            `;
        });
}

function mostrarDetalles(idCompra) {
    fetch(`http://localhost:5000/pedidos/${idCompra}`)
        .then(response => response.json())
        .then(compraActual => {
            if (!compraActual) return;

            const modal = document.getElementById('detallesModal');
            const contenido = document.getElementById('detallesContenido');
            const cancelarBtn = document.getElementById('cancelarCompra');

            let detallesHTML = `
                <p><strong>ID de Compra:</strong> ${compraActual.id}</p>
                <p><strong>Fecha:</strong> ${compraActual.fecha ? new Date(compraActual.fecha).toLocaleString() : ''}</p>
                <p><strong>Estado:</strong> ${compraActual.estado}</p>
                <p><strong>Total:</strong> $${compraActual.total ? compraActual.total.toLocaleString('es-CO') : '0'}</p>
                <h3>Productos:</h3>
                <ul>
            `;

            if (compraActual.productos && Array.isArray(compraActual.productos)) {
                compraActual.productos.forEach(producto => {
                    detallesHTML += `
                        <li>
                            ${producto.name} - Cantidad: ${producto.quantity} - 
                            Precio: $${producto.price ? producto.price.toLocaleString('es-CO') : '0'}
                        </li>
                    `;
                });
            }

            detallesHTML += '</ul>';
            contenido.innerHTML = detallesHTML;

            // Mostrar u ocultar el botón de cancelar según el estado
            if (compraActual.estado === 'Pendiente') {
                cancelarBtn.style.display = 'block';
            } else {
                cancelarBtn.style.display = 'none';
            }

            modal.style.display = 'block';
        })
        .catch(error => {
            console.error('Error al obtener los detalles de la compra:', error);
            alert('No se pudieron cargar los detalles de la compra.');
        });
}

function cancelarCompra(idCompra) {
    fetch(`http://localhost:5000/pedidos/${idCompra}`)
        .then(response => response.json())
        .then(compra => {
            if (!compra) {
                alert('No se encontró la compra');
                return;
            }

            if (compra.estado !== 'Pendiente') {
                alert('Solo se pueden cancelar compras pendientes');
                return;
            }

            // Verificar si la compra está en el historial y tiene menos de 24 horas
            const fechaCompra = new Date(compra.fecha);
            const ahora = new Date();
            const diferenciaHoras = (ahora - fechaCompra) / (1000 * 60 * 60);

            if (diferenciaHoras > 24) {
                alert('No se pueden cancelar compras que tienen más de 24 horas en el historial');
                return;
            }

            if (confirm('¿Estás seguro de que deseas cancelar esta compra?')) {
                fetch(`http://localhost:5000/pedidos/${idCompra}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ estado: 'Cancelado' })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'ok') {
                        cargarCompras(compra.cliente?.email); // Pasa el email si tu función lo requiere
                        alert('Compra cancelada exitosamente');
                    } else {
                        alert('No se pudo cancelar la compra');
                    }
                })
                .catch(error => {
                    console.error('Error al cancelar la compra:', error);
                    alert('Error al cancelar la compra');
                });
            }
        })
        .catch(error => {
            console.error('Error al obtener la compra:', error);
            alert('No se pudo obtener la compra');
        });
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
            fetch('http://localhost:5000/pedidos', {
                method: 'DELETE'
            })
            .then(response => {
                if (response.ok) {
                    cargarCompras();
                    alert('Historial de compras borrado exitosamente');
                } else {
                    alert('No se pudo borrar el historial de compras');
                }
            })
            .catch(error => {
                console.error('Error al borrar el historial de compras:', error);
                alert('Error al borrar el historial de compras');
            });
        }
    });
};

function filtrarCompras(emailUsuario) {
    const estadoFiltro = document.getElementById('filtro-estado').value;
    const fechaFiltro = document.getElementById('filtro-fecha').value;
    const tbody = document.getElementById('compras-body');

    fetch(`http://localhost:5000/pedidos?email=${encodeURIComponent(emailUsuario)}`)
        .then(response => response.json())
        .then(compras => {
            let comprasFiltradas = compras;

            if (estadoFiltro !== 'todos') {
                comprasFiltradas = comprasFiltradas.filter(c =>
                    c.estado && c.estado.toLowerCase() === estadoFiltro.toLowerCase()
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
                    <td>${compra.fecha ? new Date(compra.fecha).toLocaleDateString() : ''}</td>
                    <td>$${compra.total ? compra.total.toLocaleString('es-CO') : '0'}</td>
                    <td><span class="estado-${compra.estado ? compra.estado.toLowerCase() : ''}">${compra.estado || ''}</span></td>
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
        })
        .catch(error => {
            console.error('Error al filtrar las compras:', error);
            tbody.innerHTML = `
                <tr>
                    <td colspan="5">
                        <div class="no-compras">
                            <i class="fas fa-search"></i>
                            <p>Error al filtrar las compras</p>
                        </div>
                    </td>
                </tr>
            `;
        });
}