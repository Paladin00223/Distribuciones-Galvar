document.addEventListener('DOMContentLoaded', function() {
    const formInfoPersonal = document.getElementById('form-info-personal');

    if (formInfoPersonal) {
        formInfoPersonal.addEventListener('submit', async function(event) {
            event.preventDefault(); // Prevenir el envío tradicional del formulario

            // Recolectar los datos del formulario
            const nombre = document.getElementById('nombre').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('telefono').value; // El ID es 'telefono' en el HTML
            const direccion = document.getElementById('direccion').value;

            const data = {
                nombre: nombre,
                email: email,
                phone: phone,
                direccion: direccion
            };

            try {
                const response = await fetch('/api/perfil/update', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (result.success) {
                    alert(result.message); // Mostrar mensaje de éxito
                    // Opcional: Recargar la página para reflejar los cambios o actualizar el DOM
                    // window.location.reload(); 
                } else {
                    alert('Error: ' + result.message); // Mostrar mensaje de error
                }
            } catch (error) {
                console.error('Error al actualizar la información personal:', error);
                alert('Ocurrió un error al intentar actualizar la información. Inténtalo de nuevo.');
            }
        });
    }

    // Aquí iría la lógica para el formulario de cambiar contraseña, si lo implementas
    // const formCambiarPassword = document.getElementById('form-cambiar-password');
    // ...

});