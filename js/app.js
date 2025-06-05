const contenedor = document.getElementById('contenedor');

let html = `<article>

          <img src="img/J1.jpeg" alt="J1" class="descechable">
          <h3>Portacomida J1</h3>

		  	  <select class="precio">

            <option value="unidad">Unidad</option>
				    <option value="paquete">Paquete x 20</option>
				    <option value="caja">Paca x 200</option>

	  	    </select>

          <b>Valor: <span>$1000000000.00</span></b><br>
          
          <label for="Cant-C1"><b>cantidad</b></label>
          <input id="Cant-C1" name="cantidad">

          <br>
          <b>Total = <span>$0.00</span></b>
          <b>Acumulas = <span>$0.00</span></b>

    		  <button>Añadir al carrito</button>

        </article>`;

let productos = '';

for (let i = 0; i < 175; i++) {
    productos = productos + html;
}

contenedor.innerHTML = productos;