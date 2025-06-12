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
            localStorage.setItem('usuario', JSON.stringify({
                email: email,
                nombre: 'Administrador',
                esAdmin: true
            }));
            window.location.href = 'admin.html';
            return;
        }

        // Validación de usuario normal
        fetch('http://localhost:5000/usuarios')
            .then(response => response.json())
            .then(usuarios => {
                const usuario = usuarios.find(u => u.email === email && u.password === password);
                if (usuario) {
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

//     passwordInput.addEventListener('input', () => {
//         clearError(passwordInput);
//         if (passwordInput.value.trim() === '') {
//             showError(passwordInput, 'Este campo es requerido');
//         }
//     });

//     // Validación del formulario al enviar
//     const form = document.getElementById('loginForm');
//     if (form) {
//     form.addEventListener('submit', function(e) {
//         e.preventDefault();
//         let isValid = true;

//         // Validar usuario/email
//         if (userInput.value.trim() === '') {
//             showError(userInput, 'Este campo es requerido');
//             isValid = false;
//         } else if (userInput.value.includes('@') && !validateEmail(userInput.value)) {
//             showError(userInput, 'Por favor, ingresa un email válido');
//             isValid = false;
//         }

//         // Validar contraseña
//         if (passwordInput.value.trim() === '') {
//             showError(passwordInput, 'Este campo es requerido');
//             isValid = false;
//         }

//         if (isValid) {
//             // Aquí iría la lógica para enviar los datos al servidor
//             // Por ahora, simulamos un inicio de sesión exitoso
//             const loadingButton = form.querySelector('button[type="submit"]');
//             loadingButton.disabled = true;
//             loadingButton.textContent = 'Iniciando sesión...';

//             setTimeout(() => {
//                 window.location.href = '../index.html';
//             }, 1500);
//         }
//     });
//     }
//     // Función para recordar usuario
//     const rememberCheckbox = document.getElementById('remember');
//     if (rememberCheckbox) {
//         // Cargar usuario guardado si existe
//         const savedUser = localStorage.getItem('rememberedUser');
//         if (savedUser) {
//             userInput.value = savedUser;
//             rememberCheckbox.checked = true;
//         }

//         // Guardar usuario cuando se marca la casilla
//         rememberCheckbox.addEventListener('change', () => {
//             if (rememberCheckbox.checked) {
//                 localStorage.setItem('rememberedUser', userInput.value);
//             } else {
//                 localStorage.removeItem('rememberedUser');
//             }
//         });
//     };
// document.addEventListener('DOMContentLoaded', function () {
//     const loginForm = document.getElementById('loginForm');

//     loginForm.addEventListener('submit', function (e) {
//         e.preventDefault();

//         const email = document.getElementById('email').value.trim();
//         const password = document.getElementById('password').value;

//         // Validaciones básicas
//         if (!email || !password) {
//             alert('Por favor complete todos los campos');
//             return;
//         }

//         try {
//             // Obtener usuarios
//             fetch('http://localhost:5000/usuarios')
//                 .then(response => response.json())
//                 .then(usuarios => {
//                     const usuario = usuarios.find(u => u.email === email && u.password === password);
//                     if (usuario) {
//                         sessionStorage.setItem('usuarioActual', JSON.stringify({
//                             nombre: usuario.nombre,
//                             email: usuario.email,
//                             puntos: usuario.puntos
//                         }));
//                         alert('¡Inicio de sesión exitoso!');
//                         window.location.href = '../index.html';
//                     } else {
//                         alert('Correo electrónico o contraseña incorrectos');
//                     }
//                 })
//                 .catch(error => {
//                     console.error('Error en el inicio de sesión:', error);
//                     alert('Hubo un error al iniciar sesión. Por favor intente nuevamente.');
//                 });

//             if (usuario) {
//                 // Guardar sesión
//                 sessionStorage.setItem('usuarioActual', JSON.stringify({
//                     nombre: usuario.nombre,
//                     email: usuario.email,
//                     puntos: usuario.puntos
//                 }));

//                 // Mostrar mensaje de éxito
//                 alert('¡Inicio de sesión exitoso!');

//                 // Redirigir a la página principal
//                 window.location.href = '../index.html';
//             } else {
//                 alert('Correo electrónico o contraseña incorrectos');
//             }
//         } catch (error) {
//             console.error('Error en el inicio de sesión:', error);
//             alert('Hubo un error al iniciar sesión. Por favor intente nuevamente.');
//         }
//         // Validación de administrador
//         if (email === 'jdvargas223@gmail.com' && password === 'JDv@rgA$223#') {
//             localStorage.setItem('usuario', JSON.stringify({
//                 email: email,
//                 nombre: 'Administrador',
//                 esAdmin: true
//             }));
//             window.location.href = 'admin.html';
//             return;
//         }
//     });
// });