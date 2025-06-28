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
    const form = document.querySelector('form'); // Asume que hay un solo formulario en la página
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm_password');

    if (form && passwordInput && confirmPasswordInput) {
        // Crear un elemento para mostrar el mensaje de error
        const errorDiv = document.createElement('div');
        errorDiv.id = 'password-match-error';
        errorDiv.style.color = 'red';
        errorDiv.style.fontSize = '0.875em';
        errorDiv.style.marginTop = '5px';
        errorDiv.style.display = 'none'; // Oculto por defecto
        
        // Insertar el div de error después del campo de confirmar contraseña
        confirmPasswordInput.parentNode.insertBefore(errorDiv, confirmPasswordInput.nextSibling);

        // 1. Validación al intentar enviar el formulario
        form.addEventListener('submit', function (event) {
            if (passwordInput.value !== confirmPasswordInput.value) {
                // Prevenir el envío del formulario
                event.preventDefault();
                
                // Mostrar mensaje de error
                errorDiv.textContent = 'Las contraseñas no coinciden. Por favor, verifica.';
                errorDiv.style.display = 'block';
            }
        });

        // 2. (Opcional pero recomendado) Validación en tiempo real mientras el usuario escribe
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
    }
});