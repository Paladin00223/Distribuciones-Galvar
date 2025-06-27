document.addEventListener('DOMContentLoaded', () => {
    const cartItemsTbody = document.getElementById('cart-items');
    const totalAmountSpan = document.getElementById('total-amount');
    const navCartCountSpan = document.getElementById('nav-cart-count'); // Asumiendo que tienes un contador en la nav

    // Función para formatear el precio
    function formatPrice(value) {
        return parseFloat(value).toFixed(2);
    }

    // Añadir listeners a los botones de eliminar
    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', async () => {
            const productId = button.dataset.id;

            // Mostrar un cuadro de diálogo de confirmación
            if (window.confirm("¿Estás seguro de que deseas eliminar este producto del carrito?")) {
                try {
                    const response = await fetch('/remove_from_cart', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ product_id: productId }),
                    });

                    const data = await response.json();

                    if (data.success) {
                        // Eliminar la fila de la tabla
                        const row = button.closest('tr');
                        row.remove();

                        // Actualizar el total y el contador del carrito
                        totalAmountSpan.textContent = formatPrice(data.new_total);
                        if (navCartCountSpan) {
                            navCartCountSpan.textContent = data.cart_count;
                        }

                        // Si el carrito queda vacío, mostrar el mensaje
                        if (data.cart_count === 0) {
                            cartItemsTbody.innerHTML = `
                                <tr>
                                    <td colspan="5" style="text-align: center; padding: 2rem;">
                                        Tu carrito está vacío. <a href="/productos">¡Empieza a comprar!</a>
                                    </td>
                                </tr>`;
                        }
                    } else {
                        alert(data.message || 'Error al eliminar el producto.');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('Hubo un problema de conexión al intentar eliminar el producto.');
                }
            }
        });
    });

    // Añadir listeners a los campos de cantidad
    document.querySelectorAll('.item-quantity').forEach(input => {
        input.addEventListener('change', async () => {
            const productId = input.dataset.id;
            const newQuantity = parseInt(input.value, 10);
            const row = input.closest('tr');
            const subtotalCell = row.querySelector('td:nth-child(4)'); // La 4ta celda es el subtotal

            // Validación básica en el frontend
            if (newQuantity < 1) {
                alert("La cantidad no puede ser menor a 1.");
                // Idealmente, aquí se debería revertir al valor anterior,
                // pero por simplicidad, lo dejamos así. El backend lo validará.
                input.value = 1; // Revertir a 1 si es inválido
                return;
            }

            try {
                const response = await fetch('/update_cart_item', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ product_id: productId, new_quantity: newQuantity }),
                });

                const data = await response.json();

                if (data.success) {
                    // Actualizar la interfaz con los nuevos datos del backend
                    subtotalCell.textContent = '$' + formatPrice(data.new_subtotal);
                    totalAmountSpan.textContent = formatPrice(data.new_total);
                    if (navCartCountSpan) {
                        navCartCountSpan.textContent = data.cart_count;
                    }
                } else {
                    alert(data.message || 'Error al actualizar la cantidad.');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Hubo un problema de conexión al intentar actualizar la cantidad.');
            }
        });
    });

    // Añadir listener al botón de Confirmar Compra
    const checkoutButton = document.querySelector('.checkout-btn');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', async () => {
            // 1. Recolectar datos del formulario de envío
            const name = document.getElementById('name').value.trim();
            const address = document.getElementById('address').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const email = document.getElementById('email').value.trim();

            // 2. Validación simple en el frontend
            if (!name || !address || !phone || !email) {
                alert('Por favor, completa todos los campos de información de envío.');
                return;
            }

            const shippingData = { name, address, phone, email };

            // 3. Enviar la solicitud al backend
            try {
                const response = await fetch('/checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(shippingData),
                });

                const data = await response.json();

                if (data.success) {
                    alert(data.message + `\nTu número de pedido es: ${data.order_id}`);
                    window.location.href = '/'; // Redirigir a la página principal
                } else {
                    alert(data.message || 'Ocurrió un error al procesar la compra.');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Hubo un problema de conexión al intentar confirmar la compra.');
            }
        });
    }
});