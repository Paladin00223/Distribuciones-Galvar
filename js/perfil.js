// Cargar datos del usuario
function cargarDatosUsuario() {
    const usuario = JSON.parse(localStorage.getItem('usuario')) || {
        nombre: 'Usuario',
        email: 'usuario@ejemplo.com',
        telefono: 'No especificado',
        direccion: 'No especificada',
        puntos: 0,
        nivel: 'Bronce'
    };

    // Actualizar información en el perfil
    document.getElementById('nombre-usuario').textContent = usuario.nombre;
    document.getElementById('email-usuario').textContent = usuario.email;
    document.getElementById('telefono-usuario').textContent = usuario.telefono;

    // Actualizar formulario
    document.getElementById('nombre').value = usuario.nombre;
    document.getElementById('email').value = usuario.email;
    document.getElementById('telefono').value = usuario.telefono;
    document.getElementById('direccion').value = usuario.direccion;

    // Actualizar estadísticas
    document.getElementById('puntos-acumulados').textContent = usuario.puntos;
    document.getElementById('nivel-fidelidad').textContent = usuario.nivel;
}

// Cargar compras recientes
function cargarComprasRecientes() {
    const compras = JSON.parse(localStorage.getItem('historialCompras')) || [];
    const contenedor = document.getElementById('compras-recientes');

    if (compras.length === 0) {
        contenedor.innerHTML = '<p>No hay compras recientes</p>';
        return;
    }

    // Ordenar compras por fecha (más recientes primero)
    compras.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    // Mostrar las 5 compras más recientes
    const comprasRecientes = compras.slice(0, 5);

    contenedor.innerHTML = comprasRecientes.map(compra => `
                <div class="historial-item">
                    <h4>Compra ${compra.id}</h4>
                    <p>Fecha: ${new Date(compra.fecha).toLocaleDateString()}</p>
                    <p>Total: $${compra.total.toLocaleString('es-CO')}</p>
                    <span class="estado-badge estado-${compra.estado.toLowerCase()}">${compra.estado}</span>
                </div>
            `).join('');
}

// Actualizar total de compras
function actualizarTotalCompras() {
    const compras = JSON.parse(localStorage.getItem('historialCompras')) || [];
    document.getElementById('total-compras').textContent = compras.length;
}

// Manejar cambio de foto de perfil
document.querySelector('.cambiar-foto').addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const avatar = document.querySelector('.perfil-avatar');
                avatar.innerHTML = `<img src="${e.target.result}" alt="Foto de perfil">`;
            };
            reader.readAsDataURL(file);
        }
    };
    input.click();
});

// Manejar formulario de información personal
document.getElementById('form-info-personal').addEventListener('submit', (e) => {
    e.preventDefault();

    const usuario = {
        nombre: document.getElementById('nombre').value,
        email: document.getElementById('email').value,
        telefono: document.getElementById('telefono').value,
        direccion: document.getElementById('direccion').value,
        puntos: parseInt(document.getElementById('puntos-acumulados').textContent),
        nivel: document.getElementById('nivel-fidelidad').textContent
    };

    localStorage.setItem('usuario', JSON.stringify(usuario));
    cargarDatosUsuario();
    alert('Información actualizada correctamente');
});

// Manejar formulario de cambio de contraseña
document.getElementById('form-cambiar-password').addEventListener('submit', (e) => {
    e.preventDefault();

    const passwordActual = document.getElementById('password-actual').value;
    const passwordNueva = document.getElementById('password-nueva').value;
    const passwordConfirmar = document.getElementById('password-confirmar').value;

    if (passwordNueva !== passwordConfirmar) {
        alert('Las contraseñas nuevas no coinciden');
        return;
    }

    // Aquí iría la lógica para cambiar la contraseña
    alert('Contraseña actualizada correctamente');
    e.target.reset();
});

// Cargar datos al iniciar la página
document.addEventListener('DOMContentLoaded', () => {
    cargarDatosUsuario();
    cargarComprasRecientes();
    actualizarTotalCompras();
});