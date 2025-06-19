console.log('Hello World');










//extraido de github

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