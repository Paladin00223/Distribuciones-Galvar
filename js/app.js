// Verificación de inicio de sesión
document.addEventListener('DOMContentLoaded', function () {
  fetch('http://localhost:5000/usuarios')
    .then(response => response.json())
    .then(usuarios => {
      // usuarios es un array de objetos usuario
      console.log(usuarios);

      // Si no hay usuarios registrados, redirige al login
      if (!usuarios || usuarios.length === 0) {
        window.location.href = 'html/login.html';
        return;
      }

      // Obtener usuario actual de sessionStorage
      const usuario = JSON.parse(sessionStorage.getItem('usuarioActual'));
      if (!usuario) {
        window.location.href = 'html/login.html';
        return;
      }

      // Actualizar nombre del usuario
      const nombreElement = document.getElementById('nombre-usuario');
      if (nombreElement && usuario.nombre) {
        nombreElement.textContent = usuario.nombre;
      }

      // Si el usuario está logueado, continuar con la carga normal
      actualizarPuntosUsuario(usuario);
      // Actualizar puntos cada 30 segundos
      setInterval(() => actualizarPuntosUsuario(usuario), 30000);
    })
    .catch(error => {
      console.error('Error al obtener usuarios:', error);
      // Opcional: redirigir o mostrar mensaje de error
    });

  // Función para actualizar los puntos del usuario
  function actualizarPuntosUsuario(usuario) {
    const puntosElement = document.getElementById('puntos-usuario');
    if (puntosElement && usuario) {
      puntosElement.textContent = usuario.puntos.toLocaleString('es-CO');
    }
  }
});

//HECHO EN CLASE

const contenedor = document.getElementById('contenedor');

// Función para mostrar mensaje de error
const mostrarError = (mensaje) => {
  console.error('Error mostrado:', mensaje);
  contenedor.innerHTML = `
    <div class="error-container">
      <i class="fas fa-exclamation-circle"></i>
      <h2>Lo sentimos</h2>
      <p>${mensaje}</p>
      <button onclick="traer_datos()">Reintentar</button>
    </div>
  `;
};

// Función para validar y corregir datos
const validarDatos = (datos) => {
  console.log('Datos recibidos para validar:', datos);
  return datos.map(item => {
    // Corregir rutas de imágenes
    if (item.imagen && !item.imagen.startsWith('img/')) {
      item.imagen = `img/${item.imagen}`;
    }

    // Asegurar que los precios sean números
    if (item.unidad) {
      item.unidad = Number(item.unidad);
    }

    // Asegurar que el inventario sea un número
    if (item.inventario) {
      item.inventario = Number(item.inventario);
    }

    return item;
  });
};

//trae los datos de datos.json
const llenar_contenedor = (datos) => {
  console.log('Intentando llenar contenedor con datos:', datos);

  if (!datos || !Array.isArray(datos) || datos.length === 0) {
    mostrarError('No hay productos disponibles en este momento.');
    return;
  }

  // Validar y corregir datos
  datos = validarDatos(datos);
  console.log('Datos validados:', datos);

  let productos = '';
  const precios = {};
  const puntos = {};

  for (const item of datos) {
    let opciones = '';
    let precioInicial = 0;
    let nombre = item.nombre || 'Sin nombre';

    if (item.precios) {
      precios[nombre] = {};
      for (const presentacion in item.precios) {
        const precio = item.precios[presentacion];
        opciones += `<option value="${precio}">${presentacion.charAt(0).toUpperCase() + presentacion.slice(1)}</option>`;
        precios[nombre][presentacion] = precio;
      }
      // Si tiene unidad, úsala, si no, toma el primer precio
      precioInicial = item.precios.unidad ?? Object.values(item.precios)[0];
    } else if (item.unidad) {
      opciones = `<option value="${item.unidad}">Unidad</option>`;
      precios[nombre] = { unidad: item.unidad };
      precioInicial = item.unidad;
    } else if (item.paquete_x50) {
      opciones = `<option value="${item.paquete_x50}">Paquete x 50</option>`;
      precios[nombre] = { paquete_x50: item.paquete_x50 };
      precioInicial = item.paquete_x50;
    } else {
      opciones = `<option value="0">Sin precio</option>`;
      precios[nombre] = { sin_precio: 0 };
      precioInicial = 0;
    }

    // Calcular puntos iniciales si el producto tiene puntos (1 por cada 1000)
    const puntosIniciales = item.puntos ? Math.floor(precioInicial / 1000) : 0;

    let html = `
    <article data-categoria="${item.categoria || ''}" data-puntos="${item.puntos || false}">
      <img src="${item.imagen}" alt="${item.nombre}" onerror="this.src='img/placeholder.jpg'">
      <h3>${nombre}</h3>
      <select class="precio">
        ${opciones}
      </select>
      <b>Valor: <span>$${(precioInicial ?? 0).toLocaleString('es-CO')}</span></b><br>
      <label><b>Cantidad</b></label>
      <input name="cantidad" type="number" min="1" step="1" value="1" placeholder="Cantidad">
      <br>
      <b>Total = <span>$0.00</span></b>
      <b>Acumulas = <span>$${puntosIniciales.toLocaleString('es-CO')}</span></b>
      <button onclick="addToCart(this)">Añadir al carrito</button>
    </article>`;
    productos += html;
  }

  console.log('HTML generado:', productos);
  contenedor.innerHTML = productos;

  document.querySelectorAll('article').forEach(article => {
    const select = article.querySelector('.precio');
    const valorSpan = article.querySelector('b > span');
    const cantidadInput = article.querySelector('input[name="cantidad"]');
    const totalSpan = article.querySelectorAll('b > span')[1];
    const puntosSpan = article.querySelectorAll('b > span')[2];
    const nombre = article.querySelector('h3').textContent.trim();
    const tienePuntos = article.dataset.puntos === 'true';

    function actualizarPrecioYTotal() {
      const precio = parseFloat(select.value);
      valorSpan.textContent = `$${precio.toLocaleString('es-CO')}`;
      const cantidad = parseInt(cantidadInput.value, 10) || 0;
      const total = precio * cantidad;
      totalSpan.textContent = `$${total.toLocaleString('es-CO')}`;

      // Calcular puntos en COP si el producto tiene puntos habilitados
      if (tienePuntos) {
        const puntos = Math.floor(total / 1000);
        puntosSpan.textContent = `$${puntos.toLocaleString('es-CO')}`;
      } else {
        puntosSpan.textContent = '$0';
      }
    }

    select.addEventListener('change', actualizarPrecioYTotal);
    cantidadInput.addEventListener('input', actualizarPrecioYTotal);
    actualizarPrecioYTotal();
  });
}

const traer_datos = async () => {
  try {
    console.log('Iniciando carga de datos...');
    contenedor.innerHTML = `
      <div class="loading-container">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Cargando productos...</p>
      </div>
    `;

    console.log('Intentando cargar datos.json...');
    const respuesta = await fetch('./datos.json');
    console.log('Respuesta recibida:', respuesta);

    if (!respuesta.ok) {
      throw new Error(`Error HTTP: ${respuesta.status}`);
    }

    const datos = await respuesta.json();
    console.log('Datos cargados:', datos);

    if (!datos || !Array.isArray(datos)) {
      throw new Error('Formato de datos inválido');
    }

    llenar_contenedor(datos);
    aplicarFiltros();
  } catch (error) {
    console.error('Error al cargar los datos:', error);
    mostrarError('La página no está disponible en este momento. Por favor, intente más tarde.');
  }
};

// Asegurarse de que el DOM esté cargado antes de ejecutar
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM cargado, iniciando aplicación...');
  traer_datos();
});

// Filtros y lógica de precios
const filtro = document.getElementById('productos');
const buscarInput = document.getElementById('buscar');

function aplicarFiltros() {
  const categoria = filtro.value;
  const texto = buscarInput.value.toLowerCase();
  const articulos = document.querySelectorAll('main section article');
  articulos.forEach(art => {
    const nombre = art.querySelector('h3').textContent.toLowerCase();
    const coincideCategoria = (categoria === 'todo' || art.dataset.categoria === categoria);
    const coincideTexto = nombre.includes(texto);
    art.style.display = (coincideCategoria && coincideTexto) ? '' : 'none';
  });
}

filtro.addEventListener('change', aplicarFiltros);
buscarInput.addEventListener('input', aplicarFiltros);

// Función para añadir al carrito
function addToCart(button) {
  const article = button.closest('article');
  const nombre = article.querySelector('h3').textContent;
  const select = article.querySelector('.precio');
  const precio = parseFloat(select.value);
  const cantidad = parseInt(article.querySelector('input[name="cantidad"]').value) || 1;

  if (cantidad < 1) {
    alert('Por favor, seleccione una cantidad válida');
    return;
  }
  // Obtener el carrito actual del backend
  fetch('http://localhost:5000/cart')
    .then(response => response.json())
    .then(cart => {
      // Verificar si el producto ya está en el carrito
      const existingProductIndex = cart.findIndex(item => item.name === nombre);

      if (existingProductIndex !== -1) {
        // Si el producto ya existe, actualizar la cantidad
        cart[existingProductIndex].quantity += cantidad;
      } else {
        // Si es un producto nuevo, añadirlo al carrito
        cart.push({
          name: nombre,
          price: precio,
          quantity: cantidad
        });
      }

      // Guardar el carrito actualizado en el backend
      return fetch('http://localhost:5000/cart', {
        method: 'PUT', // O 'POST' según tu API
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cart)
      });
    })
    .then(response => {
      if (response && response.ok) {
        alert('Producto agregado al carrito');
      } else {
        alert('No se pudo actualizar el carrito');
      }
    })
    .catch(error => {
      console.error('Error al actualizar el carrito:', error);
      alert('Error al actualizar el carrito');
    });


fetch('http://localhost:5000/cart', {
    method: 'PUT', // O 'POST' según tu API
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cart)
})
.then(response => {
    if (response.ok) {
        console.log('Carrito actualizado en el backend');
    } else {
        console.error('No se pudo actualizar el carrito en el backend');
    }
})
.catch(error => {
    console.error('Error al actualizar el carrito en el backend:', error);
});

// Mostrar confirmación con un mensaje más visible
const mensaje = document.createElement('div');
mensaje.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: #4CAF50;
        color: white;
        padding: 15px 25px;
        border-radius: 5px;
        z-index: 1000;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
    `;
mensaje.textContent = `¡${cantidad} ${nombre} añadido(s) al carrito!`;
document.body.appendChild(mensaje);

// Eliminar el mensaje después de 3 segundos
setTimeout(() => {
  mensaje.remove();
}, 3000);

// Actualizar el contador del carrito si existe
updateCartCount();


}

// Función para actualizar el contador del carrito
function updateCartCount() {
  fetch('http://localhost:5000/cart')
    .then(response => response.json())
    .then(cart => {
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

      // Buscar el botón del carrito y actualizar su contador
      const cartButton = document.querySelector('a[href="html/buy.html"] button');
      if (cartButton) {
        // Crear o actualizar el contador
        let counter = cartButton.querySelector('.cart-counter');
        if (!counter) {
          counter = document.createElement('span');
          counter.className = 'cart-counter';
          counter.style.cssText = `
                position: absolute;
                top: -8px;
                right: -8px;
                background-color: #ff4444;
                color: white;
                border-radius: 50%;
                padding: 2px 6px;
                font-size: 12px;
                min-width: 18px;
                text-align: center;
            `;
          cartButton.style.position = 'relative';
          cartButton.appendChild(counter);
        }
        counter.textContent = totalItems;
      }
    })
    .catch(error => {
      console.error('Error al obtener el carrito:', error);
    });
}

// Llamar a updateCartCount cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM cargado, iniciando aplicación...');
  traer_datos();
  updateCartCount();
});