document.getElementById('aceptarTerminos').addEventListener('click', function() {
    // Suponiendo que tienes el email del usuario autenticado (ajusta según tu lógica)
    const emailUsuario = sessionStorage.getItem('usuarioEmail');
    if (emailUsuario) {
        // Obtener el usuario desde el backend para obtener su ID
        fetch(`http://localhost:5000/usuarios?email=${encodeURIComponent(emailUsuario)}`)
            .then(response => response.json())
            .then(usuarios => {
                const usuario = Array.isArray(usuarios) ? usuarios[0] : usuarios;
                if (usuario) {
                    // Actualizar el campo terminosAceptados en el backend
                    fetch(`http://localhost:5000/usuarios/${usuario.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ terminosAceptados: true })
                    })
                    .then(() => {
                        window.location.href = 'level.html'; // Redirigir a level.html
                    })
                    .catch(() => {
                        alert('No se pudo actualizar la aceptación de términos.');
                    });
                } else {
                    alert('No se encontró el usuario.');
                }
            })
            .catch(() => {
                alert('Error al obtener el usuario.');
            });
    } else {
        // Opcional: manejar el caso donde no hay usuario logueado aún.
        alert('No hay usuario autenticado.');
    }
});

document.getElementById('rechazarTerminos').addEventListener('click', function() {
    window.location.href = '../index.html';
});