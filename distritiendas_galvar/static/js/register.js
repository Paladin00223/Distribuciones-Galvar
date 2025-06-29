document.addEventListener('DOMContentLoaded', function () {
    // --- Lógica para el botón de mostrar/ocultar contraseña ---
    const togglePasswordIcons = document.querySelectorAll('.toggle-password');

    togglePasswordIcons.forEach(icon => {
        icon.addEventListener('click', function () {
            // Encuentra el campo de contraseña asociado a ESTE icono
            // (asume que el input es el elemento justo antes del span del icono)
            const passwordField = this.previousElementSibling;

            // Cambia el tipo del input de 'password' a 'text' y viceversa
            const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordField.setAttribute('type', type);

            // Cambia el icono del ojo (de abierto a cerrado y viceversa)
            this.querySelector('i').classList.toggle('fa-eye');
            this.querySelector('i').classList.toggle('fa-eye-slash');
        });
    });

    // --- Lógica para validar que las contraseñas coincidan ---
    const registerForm = document.getElementById('register-form');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm_password');
    const errorDiv = document.getElementById('register-error');
    const successDiv = document.getElementById('register-success');

    if (registerForm && passwordInput && confirmPasswordInput && errorDiv && successDiv) {
        // 1. Validación en tiempo real mientras el usuario escribe (¡buena práctica!)
        const validatePasswords = () => {
            if (confirmPasswordInput.value && passwordInput.value !== confirmPasswordInput.value) {
                errorDiv.textContent = 'Las contraseñas no coinciden.';
                errorDiv.style.display = 'block';
            } else {
                errorDiv.style.display = 'none';
            }
        };
        passwordInput.addEventListener('input', validatePasswords);
        confirmPasswordInput.addEventListener('input', validatePasswords);

        // 2. Manejo del envío del formulario
        registerForm.addEventListener('submit', async function (event) {
            // Prevenir siempre el envío tradicional
            event.preventDefault();

            // Ocultar mensajes previos
            errorDiv.style.display = 'none';
            successDiv.style.display = 'none';

            // Validar contraseñas antes de enviar
            if (passwordInput.value !== confirmPasswordInput.value) {
                errorDiv.textContent = 'Las contraseñas no coinciden. Por favor, verifica.';
                errorDiv.style.display = 'block';
                return; // Detener si no coinciden
            }

            // Recolectar datos y enviar al servidor con fetch
            const formData = new FormData(registerForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch('/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await response.json();

                if (result.success) {
                    successDiv.textContent = result.message;
                    successDiv.style.display = 'block';
                    setTimeout(() => { window.location.href = result.redirect_url; }, 2000);
                } else {
                    errorDiv.textContent = result.message || 'Error desconocido.';
                    errorDiv.style.display = 'block';
                }
            } catch (error) {
                console.error('Error en el registro:', error);
                errorDiv.textContent = 'No se pudo conectar con el servidor.';
                errorDiv.style.display = 'block';
            }
        });
    }
});