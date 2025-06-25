// Datos de ejemplo (esto vendría de tu backend)
const historialGanancias = [];

function formatearFecha(fecha) {
    return new Date(fecha).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function obtenerClaseTipo(tipo) {
    switch (tipo) {
        case 'compra': return 'tipo-compra';
        case 'paquete': return 'tipo-paquete';
        case 'referido': return 'tipo-referido';
        default: return '';
    }
}

function obtenerTextoTipo(tipo) {
    switch (tipo) {
        case 'compra': return 'Compra';
        case 'paquete': return 'Paquete';
        case 'referido': return 'Referido';
        default: return tipo;
    }
}

function filtrarHistorial() {
    const tipoFiltro = document.getElementById('filtroTipo').value;
    const periodoFiltro = document.getElementById('filtroPeriodo').value;

    let historialFiltrado = historialGanancias;

    // Filtrar por tipo
    if (tipoFiltro !== 'todos') {
        historialFiltrado = historialFiltrado.filter(item => item.tipo === tipoFiltro);
    }

    // Filtrar por período
    if (periodoFiltro !== 'todos') {
        const ahora = new Date();
        const inicioPeriodo = new Date();

        switch (periodoFiltro) {
            case 'hoy':
                inicioPeriodo.setHours(0, 0, 0, 0);
                break;
            case 'semana':
                inicioPeriodo.setDate(ahora.getDate() - 7);
                break;
            case 'mes':
                inicioPeriodo.setMonth(ahora.getMonth() - 1);
                break;
            case 'año':
                inicioPeriodo.setFullYear(ahora.getFullYear() - 1);
                break;
        }

        historialFiltrado = historialFiltrado.filter(item =>
            new Date(item.fecha) >= inicioPeriodo
        );
    }

    mostrarHistorial(historialFiltrado);
}

function mostrarHistorial(historial) {
    const contenedor = document.getElementById('contenido-historial');

    if (historial.length === 0) {
        contenedor.innerHTML = `
                    <div class="sin-registros">
                        <p>No hay registros de ganancias para mostrar</p>
                    </div>
                `;
        return;
    }

    const tabla = `
                <table class="historial-tabla">
                    <thead>
                        <tr>
                            <th>Fecha</th>
                            <th>Tipo</th>
                            <th>Descripción</th>
                            <th>Línea</th>
                            <th>Puntos</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${historial.map(item => `
                            <tr>
                                <td>${formatearFecha(item.fecha)}</td>
                                <td>
                                    <span class="tipo-ganancia ${obtenerClaseTipo(item.tipo)}">
                                        ${obtenerTextoTipo(item.tipo)}
                                    </span>
                                </td>
                                <td>${item.descripcion}</td>
                                <td>${item.linea}</td>
                                <td class="monto-positivo">+${item.puntos.toLocaleString('es-CO')}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;

    contenedor.innerHTML = tabla;
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    mostrarHistorial(historialGanancias);

    // Agregar event listeners a los filtros
    document.getElementById('filtroTipo').addEventListener('change', filtrarHistorial);
    document.getElementById('filtroPeriodo').addEventListener('change', filtrarHistorial);
});