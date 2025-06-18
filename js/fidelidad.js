// Estructura de la pirámide: cada usuario tiene un ID único y referencia a su padre
const base = 2;
const niveles = 15;
const red = document.getElementById('red');

// Agrega el referente (número 0)
let usuariosData = [{ id: 0, nivel: 0, padre: null }, { id: 1, nivel: 1, padre: 0 }];

// Generar todos los usuarios con su referente
let idActual = 2;
for (let nivel = 2; nivel <= niveles; nivel++) {
    const padres = usuariosData.filter(u => u.nivel === nivel - 1);
    for (const padre of padres) {
        for (let b = 0; b < base; b++) {
            usuariosData.push({ id: idActual, nivel: nivel, padre: padre.id });
            idActual++;
        }
    }
}

// Paquetes y puntos por nivel (según tu lógica)
const puntosPorNivel = [
    [1], // Paquete 0
    [1, 2], // Paquete 1
    [1, 2, 3], // Paquete 2
    [1, 2, 3, 4], // Paquete 3
    [1, 2, 3, 4, 5], // Paquete 4
    [1, 2, 3, 4, 5, 6], // Paquete 5
    [1, 2, 3, 4, 5, 6, 7], // Paquete 6
    [1, 2, 3, 4, 5, 6, 7, 8], // Paquete 7
    [1, 2, 3, 4, 5, 6, 7, 8, 9], // Paquete 8
    [2, 3, 4, 5, 6, 7, 8, 9, 10, 10], // Paquete 9
    [3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10], // Paquete 10
    [4, 5, 6, 7, 8, 9, 10, 10, 10, 10, 10, 10], // Paquete 11
    [5, 6, 7, 8, 9, 10, 10, 10, 10, 10, 10, 10, 10], // Paquete 12
    [6, 7, 8, 9, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10], // Paquete 13
    [7, 8, 9, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10], // Paquete 14
    [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10] // Paquete 15
];
const nombresNiveles = [
    "primera", "segunda", "tercera", "cuarta", "quinta",
    "sexta", "séptima", "octava", "novena", "décima",
    "décimo primera", "décimo segunda", "décimo tercera", "décimo cuarta", "décimo quinta"
];

// Renderizar la pirámide completa o filtrada
function renderRed(filtrarDesdeId = null, usuarioSeleccionado = null) {
    red.innerHTML = '';
    let idsVisibles = null;

    if (filtrarDesdeId) {
        // Buscar todos los descendientes del usuario seleccionado
        idsVisibles = new Set();
        function agregarDescendientes(id) {
            idsVisibles.add(id);
            usuariosData.filter(u => u.padre === id).forEach(hijo => agregarDescendientes(hijo.id));
        }
        agregarDescendientes(filtrarDesdeId);
    }

    for (let nivel = 0; nivel <= niveles; nivel++) {
        const fila = document.createElement('div');
        fila.className = 'nivel';
        usuariosData.filter(u => u.nivel === nivel).forEach(usuario => {
            if (!idsVisibles || idsVisibles.has(usuario.id)) {
                const span = document.createElement('span');
                span.className = 'usuario';
                span.textContent = usuario.id;
                span.title = `ID: ${usuario.id} | Nivel: ${usuario.nivel}` + (usuario.padre !== null ? ` | Referente: ${usuario.padre}` : '');
                span.onclick = function () {
                    document.querySelectorAll('.usuario').forEach(el => el.classList.remove('seleccionado'));
                    span.classList.add('seleccionado');
                    mostrarPanelBeneficios(usuario.id);
                    renderRed(usuario.id, usuario.id);
                };
                if (usuarioSeleccionado && usuario.id === usuarioSeleccionado) {
                    span.classList.add('seleccionado');
                }
                fila.appendChild(span);
            }
        });
        red.appendChild(fila);
        // Agrega una línea horizontal después de cada nivel para separar visualmente
        const hr = document.createElement('hr');
        hr.style.border = "2px solid #e1fcff";
        hr.style.width = "90%";
        red.appendChild(hr);
    }
}

function mostrarTodaLaRed() {
    document.querySelectorAll('.usuario').forEach(el => el.classList.remove('seleccionado'));
    document.getElementById('panel-beneficios').style.display = 'none';
    renderRed();
}

// Panel de beneficios
function mostrarPanelBeneficios(usuarioId) {
    const panel = document.getElementById('panel-beneficios');
    panel.style.display = 'block';
    const select = document.getElementById('paqueteSelect');
    if (!select.innerHTML) {
        for (let i = 0; i <= 15; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = `Paquete ${i}`;
            select.appendChild(option);
        }
    }
    select.onchange = () => actualizarInfoUsuario(usuarioId);
    actualizarInfoUsuario(usuarioId);
}

function actualizarInfoUsuario(usuarioId) {
    const paquete = parseInt(document.getElementById('paqueteSelect').value);
    const usuario = usuariosData.find(u => u.id === usuarioId);
    let html = `<b>Usuario ID:</b> ${usuario.id}<br><b>Línea:</b> ${usuario.nivel}<br><br>`;
    html += `<b>Referidos por nivel:</b><br><ul style="margin-left:-10px;">`;

    let total = 0;

    // Compra propia
    if (puntosPorNivel[paquete] && puntosPorNivel[paquete][0]) {
        total += puntosPorNivel[paquete][0];
        html += `<li>Propia compra: <span style="color:#229cb2;"><b>${puntosPorNivel[paquete][0]}</b> puntos por cada $1.000</span> 
      <span style="color:#888;">(Subtotal: <b>$${puntosPorNivel[paquete][0]}</b>)</span></li>`;
    }

    // Contar referidos por cada nivel descendente y multiplicar puntos x usuarios
    let idsNivel = [usuarioId];
    for (let nivel = 1; nivel <= 15; nivel++) {
        let hijos = usuariosData.filter(u => idsNivel.includes(u.padre));
        let subtotal = hijos.length * (puntosPorNivel[paquete][nivel] || 0);
        total += subtotal;
        html += `<li>${nivel} (${nombresNiveles[nivel - 1]}): <b>${hijos.length}</b>`;
        if (puntosPorNivel[paquete][nivel]) {
            html += ` <span style="color:#41b222;">→ ${puntosPorNivel[paquete][nivel]} puntos por cada $1.000</span>`;
            html += ` <span style="color:#888;">(Subtotal: <b>$${subtotal}</b>)</span>`;
        }
        html += `</li>`;
        idsNivel = hijos.map(h => h.id);
    }
    html += `</ul>`;
    html += `<div style="margin-top:10px;font-size:18px;"><b>TOTAL: <span style="color:#23a000;">$${total}</span></b></div>`;
    document.getElementById('infoUsuario').innerHTML = html;
}

function buscarUsuario() {
    const id = parseInt(document.getElementById('buscarUsuarioInput').value);
    if (isNaN(id)) return;
    const usuario = usuariosData.find(u => u.id === id);
    if (!usuario) {
        alert('Usuario no encontrado');
        return;
    }
    mostrarPanelBeneficios(usuario.id);
    renderRed(usuario.id, usuario.id);
    // Resalta el usuario buscado
    setTimeout(() => {
        document.querySelectorAll('.usuario').forEach(el => {
            if (el.textContent == id) el.classList.add('seleccionado');
        });
    }, 50);
}

// Inicializar
renderRed();