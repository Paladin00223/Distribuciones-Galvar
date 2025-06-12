function datosExtraCompletosYAprobados() {
            const usuario = JSON.parse(localStorage.getItem('usuario')) || {};
            return usuario.cedula && usuario.documento && usuario.estado === 'aprobado';
        }
        const paquetes = [
            { id: 0, nombre: 'Gratis', precio: 0, tipo: 'basico' },
            { id: 1, nombre: 'Paquete 1', precio: 1000, tipo: 'basico' },
            { id: 2, nombre: 'Paquete 2', precio: 2000, tipo: 'basico' },
            { id: 3, nombre: 'Paquete 3', precio: 5000, tipo: 'basico' },
            { id: 4, nombre: 'Paquete 4', precio: 10000, tipo: 'basico' },
            { id: 5, nombre: 'Paquete 5', precio: 20000, tipo: 'medio' },
            { id: 6, nombre: 'Paquete 6', precio: 50000, tipo: 'medio' },
            { id: 7, nombre: 'Paquete 7', precio: 100000, tipo: 'medio' },
            { id: 8, nombre: 'Paquete 8', precio: 200000, tipo: 'medio' },
            { id: 9, nombre: 'Paquete 9', precio: 500000, tipo: 'premium' },
            { id: 10, nombre: 'Paquete 10', precio: 1000000, tipo: 'premium' },
            { id: 11, nombre: 'Paquete 11', precio: 2000000, tipo: 'premium' },
            { id: 12, nombre: 'Paquete 12', precio: 5000000, tipo: 'premium' },
            { id: 13, nombre: 'Paquete 13', precio: 10000000, tipo: 'premium' },
            { id: 14, nombre: 'Paquete 14', precio: 20000000, tipo: 'premium' },
            { id: 15, nombre: 'Paquete 15', precio: 50000000, tipo: 'premium' }
        ];

        let paqueteSeleccionado = null;
        let usuario = null;

        // Verificación de términos y condiciones
        document.addEventListener('DOMContentLoaded', function () {
            const usuario = JSON.parse(localStorage.getItem('usuario'));
            if (!usuario || !terminosAceptados) {
                // Redirigir a la página de términos y condiciones
                window.location.href = 'terminos.html';
                return;
            }

            // Si los términos están aceptados, continuar con la carga normal
            actualizarPuntosUsuario();
            // Actualizar puntos cada 30 segundos
            setInterval(actualizarPuntosUsuario, 30000);
        });

        // Función para actualizar los puntos del usuario
        function actualizarPuntosUsuario() {
            const puntosElement = document.getElementById('puntos-usuario');
            const usuario = JSON.parse(localStorage.getItem('usuario'));
            if (puntosElement && usuario && typeof usuario.puntos === 'number') {
                puntosElement.textContent = usuario.puntos.toLocaleString('es-CO');
            } else if (puntosElement) {
                puntosElement.textContent = '0';
            }
        }

        // Función para cargar el usuario
        function cargarUsuario() {
            const usuarioStr = localStorage.getItem('usuario');
            if (usuarioStr) {
                usuario = JSON.parse(usuarioStr);
                actualizarPuntosUsuario(); // Actualizar puntos al cargar usuario
            }
        }

        // Función para actualizar la interfaz
        function actualizarInterfaz() {
            cargarUsuario(); // Recargar usuario antes de actualizar
            actualizarPuntosUsuario(); // Actualizar puntos
            const contenedor = document.getElementById('paquetes-container');
            contenedor.innerHTML = paquetes.map(paquete => generarTarjetaPaquete(paquete)).join('');
        }

        function cargarPaqueteUsuario() {
            const paqueteActual = paquetes.find(p => p.id === usuario.paquete);

            document.getElementById('paqueteActual').textContent = paqueteActual ? paqueteActual.nombre : 'Gratis';
        }

        function crearPaqueteCard(paquete) {
            const usuario = JSON.parse(localStorage.getItem('usuario')) || { paquete: 0 };
            const esActivo = paquete.id === usuario.paquete;
            const esBloqueado = paquete.id < usuario.paquete;
            const datosCompletosYAprobados = datosExtraCompletosYAprobados();

            const card = document.createElement('div');
            card.className = `paquete-card ${esActivo ? 'activo' : ''} ${esBloqueado ? 'deshabilitado' : ''}`;

            card.innerHTML = `
        <h3>${paquete.nombre}</h3>
        <div class="precio">$${paquete.precio.toLocaleString('es-CO')}</div>
        <ul class="beneficios">
            ${(obtenerBeneficios(paquete.id).map(b => `<li>${b}</li>`)).join('')}
        </ul>
        <button class="btn-comprar" 
            ${esActivo || esBloqueado || !datosCompletosYAprobados ? 'disabled' : ''} 
            onclick="comprarPaquete(${paquete.id})">
            ${!datosCompletosYAprobados ? 'Esperando aprobación' : esActivo ? 'Activo' : esBloqueado ? 'No disponible' : 'Comprar'}
        </button>`;
            return card;
        }

        function obtenerBeneficios(paqueteId) {

            if (paqueteId === 0) {
                beneficios = [
                    'Acceso a todos los productos',
                    '1 punto por cada $1.000 en compras propias'
                ];
            } else if (paqueteId === 1) {
                beneficios = [
                    '1 punto por cada $1.000 en compras propias y 2 puntos en primera línea de referidos',
                    'Bonificaciones por compra de paquetes:',
                    '- 50% de primera línea',
                    '- 5% de segunda línea',
                    '- 7% de tercera línea',
                    '- 10% de cuarta línea',
                    '- 25% de quinta línea',
                    '(si el referido compra un paquete mayor, recibes bonificaciones como si comprara el paquete 1)'
                ];
            } else if (paqueteId === 2) {
                beneficios = [
                    '1 punto por cada $1.000 en compras propias y hasta 3 puntos en referidos (hasta segunda línea)',
                    'Bonificaciones por compra de paquetes:',
                    '- 50% de primera línea',
                    '- 5% de segunda línea',
                    '- 7% de tercera línea',
                    '- 10% de cuarta línea',
                    '- 25% de quinta línea',
                    '(si el referido compra un paquete mayor, recibes bonificaciones como si comprara el paquete 2)'
                ];
            } else if (paqueteId === 3) {
                beneficios = [
                    '1 punto por cada $1.000 en compras propias y hasta 4 puntos en referidos (hasta tercera línea)',
                    'Bonificaciones por compra de paquetes:',
                    '- 50% de primera línea',
                    '- 5% de segunda línea',
                    '- 7% de tercera línea',
                    '- 10% de cuarta línea',
                    '- 25% de quinta línea',
                    '(si el referido compra un paquete mayor, recibes bonificaciones como si comprara el paquete 3)'
                ];
            } else if (paqueteId === 4) {
                beneficios = [
                    '1 punto por cada $1.000 en compras propias y hasta 5 puntos en referidos (hasta cuarta línea)',
                    'Bonificaciones por compra de paquetes:',
                    '- 50% de primera línea',
                    '- 5% de segunda línea',
                    '- 7% de tercera línea',
                    '- 10% de cuarta línea',
                    '- 25% de quinta línea',
                    '(si el referido compra un paquete mayor, recibes bonificaciones como si comprara el paquete 4)'
                ];
            } else if (paqueteId === 5) {
                beneficios = [
                    '1 punto por cada $1.000 en compras propias y hasta 6 puntos en referidos (hasta quinta línea)',
                    'Bonificaciones por compra de paquetes:',
                    '- 50% de primera línea',
                    '- 5% de segunda línea',
                    '- 7% de tercera línea',
                    '- 10% de cuarta línea',
                    '- 25% de quinta línea',
                    '(si el referido compra un paquete mayor, recibes bonificaciones como si comprara el paquete 5)'
                ];
            } else if (paqueteId === 6) {
                beneficios = [
                    '1 punto por cada $1.000 en compras propias y hasta 7 puntos en referidos (hasta sexta línea)',
                    'Bonificaciones por compra de paquetes:',
                    '- 50% de primera línea',
                    '- 5% de segunda línea',
                    '- 7% de tercera línea',
                    '- 10% de cuarta línea',
                    '- 25% de quinta línea',
                    '(si el referido compra un paquete mayor, recibes bonificaciones como si comprara el paquete 6)'
                ];
            } else if (paqueteId === 7) {
                beneficios = [
                    '1 punto por cada $1.000 en compras propias y hasta 8 puntos en referidos (hasta séptima línea)',
                    'Bonificaciones por compra de paquetes:',
                    '- 50% de primera línea',
                    '- 5% de segunda línea',
                    '- 7% de tercera línea',
                    '- 10% de cuarta línea',
                    '- 25% de quinta línea',
                    '(si el referido compra un paquete mayor, recibes bonificaciones como si comprara el paquete 7)'
                ];
            } else if (paqueteId === 8) {
                beneficios = [
                    '1 punto por cada $1.000 en compras propias y hasta 9 puntos en referidos (hasta octava línea)',
                    'Bonificaciones por compra de paquetes:',
                    '- 50% de primera línea',
                    '- 5% de segunda línea',
                    '- 7% de tercera línea',
                    '- 10% de cuarta línea',
                    '- 25% de quinta línea',
                    '(si el referido compra un paquete mayor, recibes bonificaciones como si comprara el paquete 8)'
                ];
            } else if (paqueteId === 9) {
                beneficios = [
                    '2 puntos por cada $1.000 en compras propias y hasta 10 puntos en referidos (hasta novena línea)',
                    'Bonificaciones por compra de paquetes:',
                    '- 50% de primera línea',
                    '- 5% de segunda línea',
                    '- 7% de tercera línea',
                    '- 10% de cuarta línea',
                    '- 25% de quinta línea',
                    '(si el referido compra un paquete mayor, recibes bonificaciones como si comprara el paquete 9)'
                ];
            } else if (paqueteId === 10) {
                beneficios = [
                    '3 puntos por cada $1.000 en compras propias y hasta 10 puntos en referidos (hasta décima línea)',
                    'Bonificaciones por compra de paquetes:',
                    '- 50% de primera línea',
                    '- 5% de segunda línea',
                    '- 7% de tercera línea',
                    '- 10% de cuarta línea',
                    '- 25% de quinta línea',
                    '(si el referido compra un paquete mayor, recibes bonificaciones como si comprara el paquete 10)'
                ];
            } else if (paqueteId === 11) {
                beneficios = [
                    '4 puntos por cada $1.000 en compras propias y hasta 10 puntos en referidos (hasta onceava línea)',
                    'Bonificaciones por compra de paquetes:',
                    '- 50% de primera línea',
                    '- 5% de segunda línea',
                    '- 7% de tercera línea',
                    '- 10% de cuarta línea',
                    '- 25% de quinta línea',
                    '(si el referido compra un paquete mayor, recibes bonificaciones como si comprara el paquete 11)'
                ];
            } else if (paqueteId === 12) {
                beneficios = [
                    '5 puntos por cada $1.000 en compras propias y hasta 10 puntos en referidos (hasta doceava línea)',
                    'Bonificaciones por compra de paquetes:',
                    '- 50% de primera línea',
                    '- 5% de segunda línea',
                    '- 7% de tercera línea',
                    '- 10% de cuarta línea',
                    '- 25% de quinta línea',
                    '(si el referido compra un paquete mayor, recibes bonificaciones como si comprara el paquete 12)'
                ];
            } else if (paqueteId === 13) {
                beneficios = [
                    '6 puntos por cada $1.000 en compras propias y hasta 10 puntos en referidos (hasta treceava línea)',
                    'Bonificaciones por compra de paquetes:',
                    '- 50% de primera línea',
                    '- 5% de segunda línea',
                    '- 7% de tercera línea',
                    '- 10% de cuarta línea',
                    '- 25% de quinta línea',
                    '(si el referido compra un paquete mayor, recibes bonificaciones como si comprara el paquete 13)'
                ];
            } else if (paqueteId === 14) {
                beneficios = [
                    '7 puntos por cada $1.000 en compras propias y hasta 10 puntos en referidos (hasta catorceava línea)',
                    'Bonificaciones por compra de paquetes:',
                    '- 50% de primera línea',
                    '- 5% de segunda línea',
                    '- 7% de tercera línea',
                    '- 10% de cuarta línea',
                    '- 25% de quinta línea',
                    '(si el referido compra un paquete mayor, recibes bonificaciones como si comprara el paquete 14)'
                ];
            } else if (paqueteId === 15) {
                beneficios = [
                    '10 puntos por cada $1.000 en compras propias y de hasta 15 líneas de referidos',
                    'Bonificaciones por compra de paquetes:',
                    '- 50% de primera línea',
                    '- 5% de segunda línea',
                    '- 7% de tercera línea',
                    '- 10% de cuarta línea',
                    '- 25% de quinta línea'
                ];
            } else ('');
            return beneficios;
        }

        function cargarPaquetes() {
            const grid = document.getElementById('paquetesGrid');
            const filtro = document.getElementById('filtroPaquete').value;
            grid.innerHTML = '';
            const paquetesFiltrados = filtro === 'todos' ? paquetes : paquetes.filter(p => p.tipo === filtro);
            paquetesFiltrados.forEach(paquete => {
                grid.appendChild(crearPaqueteCard(paquete));
            });
        }

        function seleccionarPaquete(paqueteId) {
            const paquete = paquetes.find(p => p.id === paquete.id);
            if (!paquete) return;

            paqueteSeleccionado = paquete;
            const modal = document.getElementById('confirmModal');
            const mensaje = document.getElementById('modalMensaje');

            mensaje.textContent = `¿Estás seguro de que deseas comprar el paquete ${paquete.nombre} por $${paquete.precio.toLocaleString('es-CO')}?`;
            modal.style.display = 'block';
        }

        function comprarPaquete(paqueteId) {
            const paquete = paquetes.find(p => p.id === paquete.id);
            if (!paquete) return;

            if (!usuario) {
                Swal.fire('Error', 'Debes iniciar sesión para comprar un paquete', 'error');
                return;
            }

            if (usuario.paquete && usuario.paquete > paquete.id) {
                Swal.fire('Error', 'No puedes comprar un paquete menor al que ya tienes', 'error');
                return;
            }

            const tienePuntosSuficientes = usuario.puntos >= paquete.precio;

            if (tienePuntosSuficientes) {
                Swal.fire({
                    title: 'Confirmar Compra',
                    html: `
                        <div class="datos-compra">
                            <p><strong>Paquete:</strong> ${paquete.nombre}</p>
                            <p><strong>Puntos a descontar:</strong> ${paquete.precio}</p>
                            <p><strong>Puntos disponibles:</strong> ${usuario.puntos}</p>
                            <div class="aviso-espera" style="margin-top: 15px;">
                                <p><strong>Importante:</strong> Los beneficios y la repartición de porcentajes se activarán después de un período de espera de 5 días hábiles, según lo establecido en los términos y condiciones.</p>
                            </div>
                        </div>
                    `,
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Comprar',
                    cancelButtonText: 'Cancelar'
                }).then((result) => {
                    if (result.isConfirmed) {
                        // Guardar la fecha de compra para calcular el período de espera
                        const fechaCompra = new Date();
                        const usuarioActual = JSON.parse(localStorage.getItem('usuarioActual')) || {};
                        usuarioActual.paquete = paquete.id;
                        usuarioActual.fechaCompraPaquete = fechaCompra.toISOString();
                        usuarioActual.paquetePendiente = true;
                        localStorage.setItem('usuarioActual', JSON.stringify(usuarioActual));

                        Swal.fire({
                            title: '¡Compra Exitosa!',
                            html: `
                                <p>Tu paquete ha sido adquirido correctamente.</p>
                                <p><strong>Fecha de activación:</strong> ${calcularFechaActivacion(fechaCompra)}</p>
                                <p>Los beneficios y la repartición de porcentajes se activarán automáticamente después del período de espera.</p>
                            `,
                            icon: 'success'
                        });

                        cargarPaqueteUsuario();
                        cargarPaquetes();
                    }
                });
            } else {
                const puntosFaltantes = paquete.precio - usuario.puntos;
                Swal.fire({
                    title: 'Puntos Insuficientes',
                    html: `
                        <div class="datos-consignacion">
                            <p>No tienes suficientes puntos para comprar este paquete.</p>
                            <p><strong>Puntos necesarios:</strong> ${paquete.precio}</p>
                            <p><strong>Puntos disponibles:</strong> ${usuario.puntos}</p>
                            <p><strong>Puntos faltantes:</strong> ${puntosFaltantes}</p>
                            <div class="aviso-espera" style="margin-top: 15px;">
                                <p><strong>Importante:</strong> Los beneficios y la repartición de porcentajes se activarán después de un período de espera de 5 días hábiles, según lo establecido en los términos y condiciones.</p>
                            </div>
                        </div>
                    `,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonText: 'Ver Datos de Consignación',
                    cancelButtonText: 'Cancelar'
                }).then((result) => {
                    if (result.isConfirmed) {
                        Swal.fire({
                            title: 'Datos para Consignación',
                            html: `
                                <div class="datos-consignacion">
                                    <p><strong>Banco:</strong> Banco Estado</p>
                                    <p><strong>Cuenta Corriente:</strong> 12345678</p>
                                    <p><strong>RUT:</strong> 12.345.678-9</p>
                                    <p><strong>Monto a Consignar:</strong> $${paquete.precio.toLocaleString('es-CO')} COP</p>
                                    <p><strong>Asunto:</strong> Compra Paquete ${paquet.id}</p>
                                </div>
                                <p class="nota-consignacion">Una vez realizada la consignación, envíanos el comprobante para activar tu paquete.</p>
                                <div class="aviso-espera" style="margin-top: 15px;">
                                    <p><strong>Importante:</strong> Los beneficios y la repartición de porcentajes se activarán después de un período de espera de 5 días hábiles, según lo establecido en los términos y condiciones.</p>
                                </div>
                            `,
                            confirmButtonText: 'Entendido'
                        });
                    }
                });
            }
        }

        // Función para calcular la fecha de activación (5 días hábiles después)
        function calcularFechaActivacion(fechaCompra) {
            let fecha = new Date(fechaCompra);
            let diasHabiles = 0;

            while (diasHabiles < 5) {
                fecha.setDate(fecha.getDate() + 1);
                // 0 es domingo, 6 es sábado
                if (fecha.getDay() !== 0 && fecha.getDay() !== 6) {
                    diasHabiles++;
                }
            }

            return fecha.toLocaleDateString('es-CO', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }

        // Función para verificar si el paquete está activo
        function verificarEstadoPaquete() {
            const usuario = JSON.parse(localStorage.getItem('usuarioActual'));
            if (usuario && usuario.paquetePendiente && usuario.fechaCompraPaquete) {
                const fechaCompra = new Date(usuario.fechaCompraPaquete);
                const fechaActual = new Date();
                const diasTranscurridos = Math.floor((fechaActual - fechaCompra) / (1000 * 60 * 60 * 24));

                if (diasTranscurridos >= 5) {
                    usuario.paquetePendiente = false;
                    localStorage.setItem('usuarioActual', JSON.stringify(usuario));

                    // Mostrar notificación de activación
                    Swal.fire({
                        title: '¡Paquete Activado!',
                        text: 'Tu paquete ha sido activado y los beneficios ya están disponibles.',
                        icon: 'success'
                    });
                }
            }
        }

        function confirmarCompra() {
            if (!paqueteSeleccionado) return;

            const usuario = JSON.parse(localStorage.getItem('usuarioActual')) || { paquete: 0 };
            usuario.paquete = paqueteSeleccionado.id;
            localStorage.setItem('usuarioActual', JSON.stringify(usuario));

            cargarPaqueteUsuario();
            cargarPaquetes();
            cerrarModal();
            alert(`¡Felicidades! Has adquirido el paquete ${paqueteSeleccionado.nombre}`);
        }

        function cerrarModal() {
            document.getElementById('confirmModal').style.display = 'none';
            paqueteSeleccionado = null;
        }

        document.getElementById('filtroPaquete').addEventListener('change', cargarPaquetes);

        window.onclick = function (event) {
            const modal = document.getElementById('confirmModal');
            if (event.target == modal) {
                cerrarModal();
            }
        }

        window.onload = function () {
            cargarUsuario();
            cargarPaqueteUsuario();
            cargarPaquetes();
            verificarEstadoPaquete();
        };
        document.getElementById('formDatosExtra').addEventListener('submit', function (e) {
            e.preventDefault();

            const cedula = document.getElementById('cedula').value.trim();
            const paquete = document.getElementById('paqueteSeleccionado').value;
            const fotoInput = document.getElementById('fotoDocumento');
            const usuario = JSON.parse(localStorage.getItem('usuario')) || {};

            if (!cedula || !paquete || !fotoInput.files[0]) {
                alert('Completa todos los campos');
                return;
            }

            // Convertir la imagen a base64
            const reader = new FileReader();
            reader.onload = function (event) {
                const fotoBase64 = event.target.result;

                fetch(`http://localhost:5000/usuarios/${usuario.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        cedula: cedula,
                        documento: fotoBase64,
                        paquete: paquete
                    })
                })
                    .then(res => res.json())
                    .then(data => {
                        if (data.status === 'ok') {
                            alert('Datos actualizados correctamente');
                        } else {
                            alert('Error al actualizar datos');
                        }
                    })
                    .catch(() => alert('Error de conexión con el servidor'));
            };
            reader.readAsDataURL(fotoInput.files[0]);
        });