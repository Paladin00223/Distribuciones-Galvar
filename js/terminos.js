document.getElementById('aceptarTerminos').addEventListener('click', function() {
            // Marcar que los términos han sido aceptados en localStorage
            const usuario = JSON.parse(localStorage.getItem('usuario'));
            if (usuario) {
                usuario.terminosAceptados = true;
                localStorage.setItem('usuario', JSON.stringify(usuario));
            } else {
                // Opcional: manejar el caso donde no hay usuario logueado aún.
                // Podrías crear un objeto temporal o simplemente confiar en que login.html lo creará.
            }
            window.location.href = 'level.html'; // Redirigir a level.html
        });

        document.getElementById('rechazarTerminos').addEventListener('click', function() {
            window.location.href = '../index.html';
        });