//HECHO EN CLASE

const contenedor = document.getElementById('contenedor');

//trae los datos de datos.json

const llenar_contenedor = (datos) => {

  let productos = '';

  for (item of datos) {

    let html = `
    <article data-categoria="descechable">
      <img src="${item.imagen}">
      <h3>${item.nombre}</h3>
      <select class="precio">
        <option value="unidad">Unidad</option>
      </select>
      <b>Valor: <span>${item.unidad}</span></b><br>
      <label for="cant-C1"><b>Cantidad</b></label>
      <input id="cant-C1" name="cantidad" type="number" min="1" step="1" placeholder="Cantidad">
      <br>
      <b>Total = <span>$0.00</span></b>
      <b>Acumulas = <span>$0.00</span></b>
      <button>Añadir al carrito</button>
    </article>`;

    productos = productos + html;
  }

  contenedor.innerHTML = productos;
}


const traer_datos = async () => {

  try {
    const respuesta = await fetch('../json/datos.json');
    const datos = await respuesta.json();
    llenar_contenedor(datos);

    } catch (error) {
    alert('La página no está disponible, por favor intente más tarde.');
    console.log(error);
  }
};

traer_datos();

//---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// HECHO CON COPILOT

// Filtros y lógica de precios
const filtro = document.getElementById('productos');
const buscarInput = document.getElementById('buscar');
const articulos = document.querySelectorAll('main section article');

function aplicarFiltros() {
  const categoria = filtro.value;
  const texto = buscarInput.value.toLowerCase();

  articulos.forEach(art => {
    const nombre = art.querySelector('h3').textContent.toLowerCase();
    const coincideCategoria = (categoria === 'todo' || art.dataset.categoria === categoria);
    const coincideTexto = nombre.includes(texto);

    if (coincideCategoria && coincideTexto) {
      art.style.display = '';
    } else {
      art.style.display = 'none';
    }
  });
}

filtro.addEventListener('change', aplicarFiltros);
buscarInput.addEventListener('input', aplicarFiltros);

// Precios de ejemplo para cada producto y opción
const precios = {
  
  

};

document.querySelectorAll('article').forEach(article => {
  const select = article.querySelector('.precio');
  const valorSpan = article.querySelector('b > span');
  const cantidadInput = article.querySelector('input[name="cantidad"]');
  const totalSpan = article.querySelectorAll('b > span')[1]; // El segundo <span> es el de Total

  if (!select || !valorSpan || !cantidadInput || !totalSpan) return;

  function actualizarPrecioYTotal() {
    let producto = article.querySelector('h3').textContent.trim();
    let opcion = select.value;

    // Para Matamoscas-Mano, distinguir color
    if (producto === "Matamoscas-Mano") {
      opcion = select.options[select.selectedIndex].textContent.toLowerCase().includes('azul') ? "unidad-azul" : "unidad-verde";
    }

    let precio = precios[producto]?.[opcion] ?? 0;
    valorSpan.textContent = `$${precio.toLocaleString('es-CO', {minimumFractionDigits: 2})}`;

    let cantidad = parseInt(cantidadInput.value, 10) || 0;
    let total = precio * cantidad;
    totalSpan.textContent = `$${total.toLocaleString('es-CO', {minimumFractionDigits: 2})}`;
  }

  select.addEventListener('change', actualizarPrecioYTotal);
  cantidadInput.addEventListener('input', actualizarPrecioYTotal);

  // Inicializar al cargar
  actualizarPrecioYTotal();
});