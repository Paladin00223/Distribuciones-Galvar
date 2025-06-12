// Cargar productos del carrito desde localStorage
function loadCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartItemsContainer = document.getElementById('cart-items');
    let total = 0;

    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
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
                               onchange="updateQuantity(${index}, this.value)">
                    </td>
                    <td>$${subtotal.toLocaleString('es-CO')}</td>
                    <td>
                        <button class="remove-btn" onclick="removeItem(${index})">Eliminar</button>
                    </td>
                `;
        cartItemsContainer.appendChild(row);
    });

    document.getElementById('total-amount').textContent = total.toLocaleString('es-CO');
}

// Actualizar cantidad de un producto
function updateQuantity(index, newQuantity) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (newQuantity < 1) {
        alert('La cantidad debe ser mayor a 0');
        return;
    }
    cart[index].quantity = parseInt(newQuantity);
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCart();
}

// Eliminar producto del carrito
function removeItem(index) {
    if (confirm('¿Está seguro de que desea eliminar este producto del carrito?')) {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        cart.splice(index, 1);
        localStorage.setItem('cart', JSON.stringify(cart));
        loadCart();
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
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        alert('El carrito está vacío');
        return;
    }

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
    const historialCompras = JSON.parse(localStorage.getItem('historialCompras')) || [];
    historialCompras.push(compra);
    localStorage.setItem('historialCompras', JSON.stringify(historialCompras));

    // Limpiar el carrito
    localStorage.removeItem('cart');

    // Mostrar mensaje de éxito con los puntos ganados
    alert(`¡Gracias por su compra! Recibirá un correo con los detalles de su pedido.\nPuntos ganados: ${puntosGanados}`);

    // Redirigir a la página de compras
    window.location.href = 'compras.html';
}

// Cargar el carrito al iniciar la página
window.onload = loadCart;

// Función para actualizar los puntos del usuario
function actualizarPuntosUsuario() {
    const puntosElement = document.getElementById('puntos-usuario');
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (puntosElement && usuario && typeof usuario.puntos === 'number') {
        puntosElement.textContent = usuario.puntos.toLocaleString('es-CO');
    } else if (puntosElement) {
        puntosElement.textContent = '0';
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    actualizarPuntosUsuario();
    // Actualizar puntos cada 30 segundos
    setInterval(actualizarPuntosUsuario, 30000);
});