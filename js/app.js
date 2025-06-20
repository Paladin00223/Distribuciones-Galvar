
//extraido de github

const llenar_contenedor = (contenedor) => {

  let productos = '';

  for (item of productos) {

    let html = `
    <article data-categoria="${item.categoria}">
      <img src="${item.imagen.img1.igm}">
      <h3>${item.nombre}</h3>
      <p>${item.describcion}
      <select class="precio">
        <option value="unidad">${item.precios}</option>
      </select>
      <b>Valor: <span>${item.valor}</span></b><br>
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