document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');
    const inputs = form.querySelectorAll('input');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmar');
    const nombreInput = document.getElementById('nombre');
    const telefonoInput = document.getElementById('telefono');

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

    // Validación de contraseña
    function validatePassword(password) {
        return password.length >= 8 &&
            /[A-Z]/.test(password) &&
            /[a-z]/.test(password) &&
            /[0-9]/.test(password);
    }

    // Validación de teléfono
    function validatePhone(phone) {
        const re = /^[0-9]{10}$/;
        return re.test(phone);
    }

    // Event listeners para validación en tiempo real
    emailInput.addEventListener('input', () => {
        clearError(emailInput);
        if (!validateEmail(emailInput.value)) {
            showError(emailInput, 'Por favor, ingresa un email válido');
        }
    });

    passwordInput.addEventListener('input', () => {
        clearError(passwordInput);
        if (!validatePassword(passwordInput.value)) {
            showError(passwordInput, 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número');
        }
    });

    confirmPasswordInput.addEventListener('input', () => {
        clearError(confirmPasswordInput);
        if (passwordInput.value !== confirmPasswordInput.value) {
            showError(confirmPasswordInput, 'Las contraseñas no coinciden');
        }
    });

    telefonoInput.addEventListener('input', () => {
        clearError(telefonoInput);
        if (!validatePhone(telefonoInput.value)) {
            showError(telefonoInput, 'Ingresa un número de teléfono válido de 10 dígitos');
        }
    });

    // Validación del formulario al enviar
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        let isValid = true;

        // Validar email
        if (!validateEmail(emailInput.value)) {
            showError(emailInput, 'Por favor, ingresa un email válido');
            isValid = false;
        }

        // Validar contraseña
        if (!validatePassword(passwordInput.value)) {
            showError(passwordInput, 'La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número');
            isValid = false;
        }

        // Validar confirmación de contraseña
        if (passwordInput.value !== confirmPasswordInput.value) {
            showError(confirmPasswordInput, 'Las contraseñas no coinciden');
            isValid = false;
        }

        // Validar nombre
        if (nombreInput.value.trim().length < 2) {
            showError(nombreInput, 'El nombre debe tener al menos 2 caracteres');
            isValid = false;
        }

        // Validar teléfono
        if (!validatePhone(telefonoInput.value)) {
            showError(telefonoInput, 'Ingresa un número de teléfono válido de 10 dígitos');
            isValid = false;
        }

        if (isValid) {
            // Aquí iría la lógica para enviar los datos al servidor
            alert('Registro exitoso');
            window.location.href = 'login.html';
        }
    });
});
document.addEventListener('DOMContentLoaded', function () {
    const registerForm = document.getElementById('registerForm');

    registerForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const nombre = document.getElementById('nombre').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const referido = document.getElementById('referido').value.trim();

        // Validaciones básicas
        if (!nombre || !email || !password || !confirmPassword) {
            alert('Por favor complete todos los campos obligatorios');
            return;
        }

        if (password !== confirmPassword) {
            alert('Las contraseñas no coinciden');
            return;
        }

        if (password.length < 6) {
            alert('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Por favor ingrese un correo electrónico válido');
            return;
        }

        try {
            // Obtener usuarios existentes
            const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

            // Verificar si el email ya está registrado
            if (usuarios.some(u => u.email === email)) {
                alert('Este correo electrónico ya está registrado');
                return;
            }

            // Crear nuevo usuario
            const nuevoUsuario = {
                nombre,
                email,
                password,
                referido: referido || null,
                puntos: 0,
                estado: 'activo',
                fechaRegistro: new Date().toISOString()
            };

            // Agregar usuario a la lista
            usuarios.push(nuevoUsuario);

            fetch('http://localhost:5000/usuarios', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre,
                    email,
                    puntos: 0,
                    estado: 'activo'
                })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.status === 'ok') {
                        alert('¡Registro exitoso! Será redirigido a la página de inicio de sesión.');
                        window.location.href = 'login.html';
                    } else {
                        alert('Hubo un error al registrar el usuario.');
                    }
                })
                .catch(error => {
                    console.error('Error en el registro:', error);
                    alert('Hubo un error al registrar el usuario. Por favor intente nuevamente.');
                });
        } catch (error) {
            console.error('Error en el registro:', error);
            alert('Hubo un error al registrar el usuario. Por favor intente nuevamente.');
        }
    });
});
document.getElementById('togglePassword').addEventListener('click', function () {
    const passwordInput = document.getElementById('password');
    const iconoOjo = document.getElementById('icono-ojo');
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