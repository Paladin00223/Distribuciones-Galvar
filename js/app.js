//HECHO EN CLASE

const contenedor = document.getElementById('contenedor');

//trae los datos de datos.json

const llenar_contenedor = (datos) => {
  let productos = '';
  const precios = {};

  for (const item of datos) {
    // Construye las opciones del select
    let opciones = '';
    precios[item.nombre] = {};
    for (const presentacion in item.precios) {
      opciones += `<option value="${presentacion}">${presentacion.charAt(0).toUpperCase() + presentacion.slice(1)}</option>`;
      precios[item.nombre][presentacion] = item.precios[presentacion];
    }

    let html = `
    <article data-categoria="descechable">
      <img src="${item.imagen}">
      <h3>${item.nombre}</h3>
      <select class="precio">
        ${opciones}
      </select>
      <b>Valor: <span>$${item.precios.unidad.toLocaleString('es-CO')}</span></b><br>
      <label><b>Cantidad</b></label>
      <input name="cantidad" type="number" min="1" step="1" placeholder="Cantidad">
      <br>
      <b>Total = <span>$0.00</span></b>
      <b>Acumulas = <span>$0.00</span></b>
      <button>Añadir al carrito</button>
    </article>`;
    productos += html;
  } // <-- Aquí debe cerrar el for

  contenedor.innerHTML = productos;

  // Ahora sí, agrega los listeners a los artículos recién creados
  document.querySelectorAll('article').forEach(article => {
    const select = article.querySelector('.precio');
    const valorSpan = article.querySelector('b > span');
    const cantidadInput = article.querySelector('input[name="cantidad"]');
    const totalSpan = article.querySelectorAll('b > span')[1];
    const nombre = article.querySelector('h3').textContent.trim();

    function actualizarPrecioYTotal() {
      const opcion = select.value;
      const precio = precios[nombre][opcion] || 0;
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
    const respuesta = await fetch('../datos.json');
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