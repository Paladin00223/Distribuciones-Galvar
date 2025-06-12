document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');
    const iconoOjo = document.getElementById('icono-ojo-password');

    if (!loginForm) return;

    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (!email || !password) {
            alert('Por favor complete todos los campos');
            return;
        }

        // Validación de administrador
        if (email === 'jdvargas223@gmail.com' && password === 'JDv@rgA$223#') {
            // Si quieres guardar el admin en sessionStorage:
            sessionStorage.setItem('usuarioActual', JSON.stringify({
                email: email,
                nombre: 'Administrador',
                esAdmin: true
            }));
            window.location.href = 'admin.html';
            return;
        }

        // Validación de usuario normal usando el backend
        fetch(`http://localhost:5000/usuarios?email=${encodeURIComponent(email)}`)
            .then(response => response.json())
            .then(usuarios => {
                // Si el backend devuelve un array, toma el primero
                const usuario = Array.isArray(usuarios) ? usuarios[0] : usuarios;
                if (usuario && usuario.password === password) {
                    sessionStorage.setItem('usuarioActual', JSON.stringify({
                        nombre: usuario.nombre,
                        email: usuario.email,
                        puntos: usuario.puntos
                    }));
                    alert('¡Inicio de sesión exitoso!');
                    window.location.href = '../index.html';
                } else {
                    alert('Correo electrónico o contraseña incorrectos');
                }
            })
            .catch(error => {
                console.error('Error en el inicio de sesión:', error);
                alert('Hubo un error al iniciar sesión. Por favor intente nuevamente.');
            });
    });

    if (togglePassword && passwordInput && iconoOjo) {
        togglePassword.addEventListener('click', function () {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                iconoOjo.classList.remove('fa-eye');
                iconoOjo.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                iconoOjo.classList.remove('fa-eye-slash');
                iconoOjo.classList.add('fa-eye');
            }
        });
    }
});