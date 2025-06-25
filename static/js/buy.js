// Cargar productos del carrito desde localhost
function loadCart() {
    fetch('http://localhost:5000/cart')
        .then(response => response.json())
        .then(cart => {
            const cartItemsContainer = document.getElementById('cart-items');
            let total = 0;

            cartItemsContainer.innerHTML = '';

            if (!cart || cart.length === 0) {
                cartItemsContainer.innerHTML = `
                    <tr>
                        <td colspan="5" class="empty-cart">
                            <i class="fas fa-shopping-cart"></i>
                            <p>No hay productos en el carrito</p>
                        </td>
                    </tr>
                `;
                document.getElementById('total-amount').textContent = '0';
                return;
            }

            cart.forEach((item, index) => {
                const row = document.createElement('tr');
                const subtotal = item.price * item.quantity;
                total += subtotal;

                row.innerHTML = `
                    <td>${item.name} ${item.opcion ? `(${item.opcion})` : ''}</td>
                    <td>$${item.price.toLocaleString('es-CO')}</td>
                    <td>
                        <input type="number" class="quantity-input" 
                               value="${item.quantity}" min="1" 
                               onchange="updateQuantity(${item.id || index}, this.value)">
                    </td>
                    <td>$${subtotal.toLocaleString('es-CO')}</td>
                    <td>
                        <button class="remove-btn" onclick="removeItem(${item.id || index})">Eliminar</button>
                    </td>
                `;
                cartItemsContainer.appendChild(row);
            });

            document.getElementById('total-amount').textContent = total.toLocaleString('es-CO');
        })
        .catch(error => {
            console.error('Error al cargar el carrito:', error);
            // Opcional: mostrar mensaje de error o carrito vacío
            const cartItemsContainer = document.getElementById('cart-items');
            cartItemsContainer.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-cart">
                        <i class="fas fa-shopping-cart"></i>
                        <p>Error al cargar el carrito</p>
                    </td>
                </tr>
            `;
            document.getElementById('total-amount').textContent = '0';
        });
}

// Actualizar cantidad de un producto
function updateQuantity(itemId, newQuantity) {
    if (newQuantity < 1) {
        alert('La cantidad debe ser mayor a 0');
        return;
    }

    fetch('http://localhost:5000/cart')
        .then(response => response.json())
        .then(cart => {
            const itemIndex = cart.findIndex(item => (item.id || item.name) === itemId);
            if (itemIndex === -1) {
                alert('Producto no encontrado en el carrito');
                return;
            }
            cart[itemIndex].quantity = parseInt(newQuantity);

            // Actualizar el carrito en el backend
            return fetch('http://localhost:5000/cart', {
                method: 'PUT', // O 'POST' según tu API
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cart)
            });
        })
        .then(response => {
            if (response && response.ok) {
                loadCart();
            } else if (response) {
                alert('No se pudo actualizar la cantidad');
            }
        })
        .catch(error => {
            console.error('Error al actualizar la cantidad:', error);
            alert('Error al actualizar la cantidad');
        });
}

// Eliminar producto del carrito
function removeItem(itemId) {
    if (confirm('¿Está seguro de que desea eliminar este producto del carrito?')) {
        fetch('http://localhost:5000/cart')
            .then(response => response.json())
            .then(cart => {
                const itemIndex = cart.findIndex(item => (item.id || item.name) === itemId);
                if (itemIndex === -1) {
                    alert('Producto no encontrado en el carrito');
                    return;
                }
                cart.splice(itemIndex, 1);

                // Actualizar el carrito en el backend
                return fetch('http://localhost:5000/cart', {
                    method: 'PUT', // O 'POST' según tu API
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(cart)
                });
            })
            .then(response => {
                if (response && response.ok) {
                    loadCart();
                } else if (response) {
                    alert('No se pudo eliminar el producto');
                }
            })
            .catch(error => {
                console.error('Error al eliminar el producto del carrito:', error);
                alert('Error al eliminar el producto del carrito');
            });
    }
}

// Procesar la compra
function processCheckout() {
    const name = document.getElementById('name').value;
    const address = document.getElementById('address').value;
    const phone = document.getElementById('phone').value;
    const email = document.getElementById('email').value;

    if (!name || !address || !phone || !email) {
        alert('Por favor complete todos los campos del formulario');
        return;
    }

    // Obtener el carrito actual
    fetch('http://localhost:5000/cart')
        .then(response => response.json())
        .then(cart => {
            if (!cart || cart.length === 0) {
                alert('El carrito está vacío');
                return;
            }

            // Aquí continúa tu lógica con el carrito
        })
        .catch(error => {
            console.error('Error al obtener el carrito:', error);
            alert('No se pudo obtener el carrito');
        });

    // Calcular el total y los puntos
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const puntosGanados = Math.floor(total / 1000);

    // Crear el registro de compra
    const compra = {
        id: 'COMP-' + Date.now(),
        fecha: new Date().toISOString(),
        productos: cart,
        total: total,
        estado: 'Pendiente',
        puntosGanados: puntosGanados,
        cliente: {
            nombre: name,
            direccion: address,
            telefono: phone,
            email: email
        }
    };

    // Guardar en el historial de compras
    fetch('http://localhost:5000/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(compra)
    })
        .then(response => response.json())
        .then(data => {
            // Limpiar el carrito en el backend
            return fetch('http://localhost:5000/cart', {
                method: 'DELETE'
            });
        })
        .then(() => {
            // Mostrar mensaje de éxito con los puntos ganados
            alert(`¡Gracias por su compra! Recibirá un correo con los detalles de su pedido.\nPuntos ganados: ${puntosGanados}`);

            // Redirigir a la página de compras
            window.location.href = 'compras.html';
        })
        .catch(error => {
            console.error('Error al procesar la compra:', error);
            alert('No se pudo completar la compra');
        });
}

// Cargar el carrito al iniciar la página
window.onload = loadCart;

// Función para actualizar los puntos del usuario
function actualizarPuntosUsuario(email) {
    const puntosElement = document.getElementById('puntos-usuario');
    if (!email) {
        if (puntosElement) puntosElement.textContent = '0';
        return;
    }

    fetch(`http://localhost:5000/usuarios?email=${encodeURIComponent(email)}`)
        .then(response => response.json())
        .then(usuarios => {
            // Suponiendo que el backend devuelve un array de usuarios
            const usuario = Array.isArray(usuarios) ? usuarios[0] : usuarios;
            if (puntosElement && usuario && typeof usuario.puntos === 'number') {
                puntosElement.textContent = usuario.puntos.toLocaleString('es-CO');
            } else if (puntosElement) {
                puntosElement.textContent = '0';
            }
        })
        .catch(error => {
            console.error('Error al obtener los puntos del usuario:', error);
            if (puntosElement) puntosElement.textContent = '0';
        });
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    actualizarPuntosUsuario();
    // Actualizar puntos cada 30 segundos
    setInterval(actualizarPuntosUsuario, 30000);
});