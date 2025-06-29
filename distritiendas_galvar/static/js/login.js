document.addEventListener('DOMContentLoaded', () => {
    // --- Lógica para el botón de mostrar/ocultar contraseña ---
    const togglePassword = document.querySelector('#togglePassword');
    const passwordInput = document.querySelector('#password');

    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function () {
            // Cambiar el tipo del input de password a text y viceversa
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);

            // Cambiar el ícono del ojo (forma más concisa)
            const icon = this.querySelector('i');
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        });
    }

    // --- Lógica para manejar el envío del formulario de login ---
    const loginForm = document.getElementById('login-form'); // Asume que tu form tiene id="login-form"
    const emailInput = document.getElementById('email'); // Asume que tu input de email tiene id="email"
    const errorDiv = document.getElementById('login-error'); // Asume que tienes un div con id="login-error" para mostrar errores
    const submitButton = document.getElementById('login-submit-btn'); // Botón de envío

    if (loginForm && emailInput && passwordInput && errorDiv) {
        loginForm.addEventListener('submit', async (event) => {
            // 1. Prevenir el envío tradicional del formulario que recarga la página
            event.preventDefault();

            // Ocultar mensajes de error previos
            errorDiv.style.display = 'none';
            errorDiv.textContent = '';

            // 2. Recolectar los datos del formulario
            const email = emailInput.value;
            const password = passwordInput.value;
            
            // MEJORA: Mostrar estado de carga
            submitButton.disabled = true;
            submitButton.querySelector('.btn-text').style.display = 'none';
            submitButton.querySelector('.spinner').style.display = 'inline-block';

            // 3. Enviar los datos al servidor usando fetch
            try {
                const response = await fetch('/login', { // ¡Asegúrate que esta ruta '/login' sea correcta!
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email: email, password: password }),
                });

                const data = await response.json();

                // 4. Procesar la respuesta del servidor
                if (data.success) {
                    // Si el login es exitoso, redirigir a la página principal o al perfil
                    window.location.href = data.redirect_url || '/';
                } else {
                    // Si hay un error, mostrarlo en el div de errores
                    errorDiv.textContent = data.message || 'Error desconocido. Inténtalo de nuevo.';
                    errorDiv.style.display = 'block';
                }
            } catch (error) {
                // Manejar errores de red o conexión
                console.error('Error en el proceso de login:', error);
                errorDiv.textContent = 'No se pudo conectar con el servidor. Revisa tu conexión a internet.';
                errorDiv.style.display = 'block';
            } finally {
                // MEJORA: Restaurar el botón sin importar el resultado
                submitButton.disabled = false;
                submitButton.querySelector('.btn-text').style.display = 'inline-block';
                submitButton.querySelector('.spinner').style.display = 'none';
            }
        });
    }
});