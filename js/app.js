//HECHO EN CLASE

const contenedor = document.getElementById('contenedor');

//trae los datos de datos.json

const llenar_contenedor = (datos) => {
  let productos = '';
  const precios = {};

  let puntos = {};

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

    let html = `
    <article data-categoria="${item.categoria || ''}">
      <img src="${item.imagen}">
      <h3>${nombre}</h3>
      <select class="precio">
        ${opciones}
      </select>
      <b>Valor: <span>$${(precioInicial ?? 0).toLocaleString('es-CO')}</span></b><br>
      <label><b>Cantidad</b></label>
      <input name="cantidad" type="number" min="1" step="1" placeholder="Cantidad">
      <br>
      <b>Total = <span>$0.00</span></b>
      <b>Acumulas = <span>$0.00</span></b>
      <button>Añadir al carrito</button>
    </article>`;
    productos += html;
  }

  contenedor.innerHTML = productos;

  document.querySelectorAll('article').forEach(article => {
    const select = article.querySelector('.precio');
    const valorSpan = article.querySelector('b > span');
    const cantidadInput = article.querySelector('input[name="cantidad"]');
    const totalSpan = article.querySelectorAll('b > span')[1];
    const nombre = article.querySelector('h3').textContent.trim();

    function actualizarPrecioYTotal() {
      const opcion = select.value;
      // Siempre verifica que exista el precio antes de usarlo
      const precio = (precios[nombre] && precios[nombre][opcion]) ? precios[nombre][opcion] : 0;
      valorSpan.textContent = `$${precio.toLocaleString('es-CO')}`;
      const cantidad = parseInt(cantidadInput.value, 10) || 0;
      const total = precio * cantidad;
      totalSpan.textContent = `$${total.toLocaleString('es-CO')}`;
    }

    select.addEventListener('change', actualizarPrecioYTotal);
    cantidadInput.addEventListener('input', actualizarPrecioYTotal);
    actualizarPrecioYTotal();
  });
}


const traer_datos = async () => {
  try {
    const respuesta = await fetch('datos.json'); // Ajusta la ruta según tu estructura
    const datos = await respuesta.json();
    llenar_contenedor(datos);
    aplicarFiltros(); // Filtra los artículos generados
  } catch (error) {
    alert('La página no está disponible, por favor intente más tarde.');
    console.log(error);
  }
};

traer_datos();

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