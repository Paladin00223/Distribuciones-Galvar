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
        opciones += `<option value="${presentacion}">${presentacion.charAt(0).toUpperCase() + presentacion.slice(1)}</option>`;
        precios[nombre][presentacion] = item.precios[presentacion];
      }
      // Si tiene unidad, úsala, si no, toma el primer precio
      precioInicial = item.precios.unidad ?? Object.values(item.precios)[0];
    } else if (item.unidad) {
      opciones = `<option value="unidad">Unidad</option>`;
      precios[nombre] = { unidad: item.unidad };
      precioInicial = item.unidad;
    } else if (item.paquete_x50) {
      opciones = `<option value="paquete_x50">Paquete x 50</option>`;
      precios[nombre] = { paquete_x50: item.paquete_x50 };
      precioInicial = item.paquete_x50;
    } else {
      opciones = `<option value="sin_precio">Sin precio</option>`;
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
      <input name="cantidad" type="number" min="1" step="1" placeholder="Cantidad">
      <br>
      <b>Total = <span>$0.00</span></b>
      <b>Acumulas = <span>$${puntosIniciales.toLocaleString('es-CO')}</span></b>
      <button>Añadir al carrito</button>
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
      const opcion = select.value;
      // Siempre verifica que exista el precio antes de usarlo
      const precio = (precios[nombre] && precios[nombre][opcion]) ? precios[nombre][opcion] : 0;
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