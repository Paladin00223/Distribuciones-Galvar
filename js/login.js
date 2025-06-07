document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    const userInput = document.getElementById('user');
    const passwordInput = document.getElementById('password');

    // Función para mostrar mensajes de error
    function showError(input, message) {
        const formGroup = input.parentElement;
        const errorMessage = formGroup.querySelector('.error-message');
        input.classList.add('error');
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }

    // Función para limpiar mensajes de error
    function clearError(input) {
        const formGroup = input.parentElement;
        const errorMessage = formGroup.querySelector('.error-message');
        input.classList.remove('error');
        errorMessage.style.display = 'none';
    }

    // Validación de email
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Event listeners para validación en tiempo real
    userInput.addEventListener('input', () => {
        clearError(userInput);
        if (userInput.value.trim() === '') {
            showError(userInput, 'Este campo es requerido');
        } else if (userInput.value.includes('@') && !validateEmail(userInput.value)) {
            showError(userInput, 'Por favor, ingresa un email válido');
        }
    });

    passwordInput.addEventListener('input', () => {
        clearError(passwordInput);
        if (passwordInput.value.trim() === '') {
            showError(passwordInput, 'Este campo es requerido');
        }
    });

    // Validación del formulario al enviar
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        let isValid = true;

        // Validar usuario/email
        if (userInput.value.trim() === '') {
            showError(userInput, 'Este campo es requerido');
            isValid = false;
        } else if (userInput.value.includes('@') && !validateEmail(userInput.value)) {
            showError(userInput, 'Por favor, ingresa un email válido');
            isValid = false;
        }

        // Validar contraseña
        if (passwordInput.value.trim() === '') {
            showError(passwordInput, 'Este campo es requerido');
            isValid = false;
        }

        if (isValid) {
            // Aquí iría la lógica para enviar los datos al servidor
            // Por ahora, simulamos un inicio de sesión exitoso
            const loadingButton = form.querySelector('button[type="submit"]');
            loadingButton.disabled = true;
            loadingButton.textContent = 'Iniciando sesión...';

            setTimeout(() => {
                window.location.href = '../index.html';
            }, 1500);
        }
    });

    // Función para recordar usuario
    const rememberCheckbox = document.getElementById('remember');
    if (rememberCheckbox) {
        // Cargar usuario guardado si existe
        const savedUser = localStorage.getItem('rememberedUser');
        if (savedUser) {
            userInput.value = savedUser;
            rememberCheckbox.checked = true;
        }

        // Guardar usuario cuando se marca la casilla
        rememberCheckbox.addEventListener('change', () => {
            if (rememberCheckbox.checked) {
                localStorage.setItem('rememberedUser', userInput.value);
            } else {
                localStorage.removeItem('rememberedUser');
            }
        });
    }
}); 