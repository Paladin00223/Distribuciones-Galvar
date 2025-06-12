// Cargar datos del usuario
function cargarDatosUsuario(emailUsuario) {
    fetch(`http://localhost:5000/usuarios?email=${encodeURIComponent(emailUsuario)}`)
        .then(response => response.json())
        .then(usuarios => {
            const usuario = Array.isArray(usuarios) ? usuarios[0] : usuarios || {
                nombre: 'Usuario',
                email: 'usuario@ejemplo.com',
                telefono: 'No especificado',
                direccion: 'No especificada',
                puntos: 0,
                nivel: 'Bronce'
            };

            // Actualizar información en el perfil
            document.getElementById('nombre-usuario').textContent = usuario.nombre || 'Usuario';
            document.getElementById('email-usuario').textContent = usuario.email || 'usuario@ejemplo.com';
            document.getElementById('telefono-usuario').textContent = usuario.telefono || 'No especificado';

            // Actualizar formulario
            document.getElementById('nombre').value = usuario.nombre || '';
            document.getElementById('email').value = usuario.email || '';
            document.getElementById('telefono').value = usuario.telefono || '';
            document.getElementById('direccion').value = usuario.direccion || '';

            // Actualizar estadísticas
            document.getElementById('puntos-acumulados').textContent = usuario.puntos || 0;
            document.getElementById('nivel-fidelidad').textContent = usuario.nivel || 'Bronce';
        })
        .catch(error => {
            console.error('Error al cargar los datos del usuario:', error);
            // Opcional: puedes mostrar valores por defecto o un mensaje de error aquí
        });
}

// Cargar compras recientes
function cargarComprasRecientes(emailUsuario) {
    const contenedor = document.getElementById('compras-recientes');

    fetch(`http://localhost:5000/pedidos?email=${encodeURIComponent(emailUsuario)}`)
        .then(response => response.json())
        .then(compras => {
            if (!compras || compras.length === 0) {
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
                    <p>Fecha: ${compra.fecha ? new Date(compra.fecha).toLocaleDateString() : ''}</p>
                    <p>Total: $${compra.total ? compra.total.toLocaleString('es-CO') : '0'}</p>
                    <span class="estado-badge estado-${compra.estado ? compra.estado.toLowerCase() : ''}">${compra.estado || ''}</span>
                </div>
            `).join('');
        })
        .catch(error => {
            console.error('Error al cargar las compras recientes:', error);
            contenedor.innerHTML = '<p>Error al cargar las compras recientes</p>';
        });
}

// Actualizar total de compras
function actualizarTotalCompras(emailUsuario) {
    fetch(`http://localhost:5000/pedidos?email=${encodeURIComponent(emailUsuario)}`)
        .then(response => response.json())
        .then(compras => {
            document.getElementById('total-compras').textContent = compras.length;
        })
        .catch(error => {
            console.error('Error al obtener las compras:', error);
            document.getElementById('total-compras').textContent = '0';
        });
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

    // Obtener el usuario actual del backend para obtener su ID
    fetch(`http://localhost:5000/usuarios?email=${encodeURIComponent(usuario.email)}`)
        .then(response => response.json())
        .then(usuarios => {
            const usuarioActual = Array.isArray(usuarios) ? usuarios[0] : usuarios;
            if (!usuarioActual) {
                alert('No se encontró el usuario');
                return;
            }

            // Actualizar la información personal en el backend
            fetch(`http://localhost:5000/usuarios/${usuarioActual.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(usuario)
            })
            .then(response => response.json())
            .then(data => {
                if (data.status === 'ok') {
                    cargarDatosUsuario(usuario.email);
                    alert('Información actualizada correctamente');
                } else {
                    alert('Error al actualizar la información');
                }
            })
            .catch(() => alert('Error de conexión con el servidor'));
        })
        .catch(() => alert('Error al obtener el usuario'));
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