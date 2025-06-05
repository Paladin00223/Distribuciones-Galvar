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
  "Portacomida-J1": {
    unidad: 700,
    paquete: 7800,
    caja: 77000
  },
  "Matamoscas-Mano": {
    "unidad": 2000,
  },
  "Bolsa-de-Papel": {

  },
  "Bolsa-Manigueta-1.5kl": {
    "paquete-x100": 2500,
  },
  "Bolsa-Manigueta-3kl": {
    "paquete-x100": 3500,
  },
  "Bolsa-Manigueta-5kl": {
    "paquete-x100": 4800,
  },
  "Bolsa-Manigueta-10kl": {
    "paquete-x100": 6300,
  },
  "Vasos-Tuc-12oz": {
    "paquete": 5000,
  },
  "Sobrebase-16,5": {
    "unidad": 200,
    "paquete": 6100,
  },
  "Sobrebase-22": {
    "unidad": 400,
    "paquete": 10800,
  },
  "Sobrebase-24,8": {
    "unidad": 500,
    "paquete": 13700,
  },
  "Bisturi-grande": {
    "unidad": 3000,
  },
  "Bisturi-pequeño": {
    "unidad": 2000,
  },
  "Papel-cristal": {
    "unidad": 1500,
  },
  "Crayones": {
    "unidad": 3500,
  },
  "Portacomida-C1": {
    "unidad": 500,
  },
  "Plato-pando-26": {
    "paquete": 6200,
  }
  "Plato-pando-23": {
    "paquete": 4500,
  },
  "Plato-hondo-25": {
    "paquete": 6200,
  },
  "Servilleta-Favorita": {
    "paquete": 4000,
  },
  "Servilleta-Bueno": {
    "paquete": 4000,
  },
  "Vaso-Wau-12oz": {
    "paquete": 5300,
  },
  "Vaso-Tuc-10oz": {
    "paquete": 4000,
  },
  "Vaso-Wau-14oz": {
    "paquete": 3800,
  },
  "Vaso-Wau-5oz-blanco": {
    "paquete": 2550,
  },
  "Vaso-Vacan-7oz": {
    "paquete": 2200,
  },
  "Plato-Pando-15.5": {
    "paquete": 2500,
  },
  "Plato-Hondo-30": {
    "paquete": 6200,
  },
  "Juego-Escalera": {
    "unidad": 1000,
  },
  "Cartulina-pliego": {
    "unidad": 1000,
  },
  "Cartulina-octavo": {
    "unidad": 400,
  },
  "Cuaderno-100h": {
    "unidad": 1000,
  },
  "Cuaderno-Cosido-50h": {
    "unidad": 2500,
  },
  "Cuaderno-Cosido-100h": {
    "unidad": 3000,
  },
  "Regla-Goma": {
    "unidad": 700,
  },
  "Regla-Metal": {
    "unidad": 700,
  },
  "Regla-Madera": {
    "unidad": 1000,
  },
  "Plastilina-pequeña": {
    "unidad": 1500,
  },
  "Plastilina-grande": {
    "unidad": 2300,
  },
  "Pegamento-Barra": {
    "unidad": 4000,
  },
  "Pegamento-Sipega-125g": {
    "unidad": 2500,
  },
  "Pegamento-Sipega-pequeño": {
    "unidad": 800,
  },
  "Silicona-Barra-delgada": {
    "unidad": 1000,
  },
  "Silicona-Barra-grande": {
    "unidad": 1500,
  },
  "Pincel-Grande": {
    "unidad": 2000,
  },
  "Silicona-liquida": {
    "unidad": 3800,
  },
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
