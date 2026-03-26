/**
 * checkout.js — Script exclusivo para la pagina de pago (checkout.html)
 * Maneja: autenticacion, carga del carrito, datos de envio, simulacion de pago.
 */

const estado = {
    token: localStorage.getItem('token') || '',
    carrito: [],
    subtotalProductos: 0,
    costoEnvio: 0,
};

// ─── Elementos del DOM ───────────────────────────────────────────────────────
const tablaCarrito        = document.getElementById('tablaCarrito');
const totalCarrito        = document.getElementById('totalCarrito');
const subtotalProductosEl = document.getElementById('subtotalProductos');
const costoEnvioDisplay   = document.getElementById('costoEnvioDisplay');
const contenedorMensajes  = document.getElementById('contenedorMensajes');
const formPagoTarjeta     = document.getElementById('formPagoTarjeta');
const respuestaPago       = document.getElementById('respuestaPagoTarjeta');

// Envío
const opcionDomicilio = document.getElementById('opcionDomicilio');
const opcionRetiro    = document.getElementById('opcionRetiro');
const avisoRetiro     = document.getElementById('avisoRetiro');
const camposEnvio     = document.getElementById('camposEnvio');
const selectRegion    = document.getElementById('selectRegion');
const inputCostoEnvio = document.getElementById('inputCostoEnvio');

// ─── Utilidades ──────────────────────────────────────────────────────────────
function formatearPrecio(valor) {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0,
    }).format(Number(valor));
}

function mostrarMensaje(texto, tipo = 'info') {
    contenedorMensajes.textContent = texto;
    contenedorMensajes.className = `alert alert-${tipo}`;
    contenedorMensajes.classList.remove('d-none');
}

function ocultarMensaje() {
    contenedorMensajes.classList.add('d-none');
}

function obtenerTexto(formData, campo) {
    const v = formData.get(campo);
    return typeof v === 'string' ? v : '';
}

// ─── Totales ─────────────────────────────────────────────────────────────────
function actualizarTotales() {
    if (subtotalProductosEl) subtotalProductosEl.textContent = formatearPrecio(estado.subtotalProductos);
    if (costoEnvioDisplay)   costoEnvioDisplay.textContent   = formatearPrecio(estado.costoEnvio);
    if (totalCarrito)        totalCarrito.textContent         = formatearPrecio(estado.subtotalProductos + estado.costoEnvio);
}

// ─── Logica de Envio ──────────────────────────────────────────────────────────
function aplicarModoDespacho(modo) {
    const esDomicilio = modo === 'domicilio';

    // Mostrar/ocultar aviso de retiro
    if (avisoRetiro) avisoRetiro.classList.toggle('d-none', esDomicilio);

    // Habilitar/deshabilitar campos de envio
    if (camposEnvio) {
        const inputs = camposEnvio.querySelectorAll('input, select');
        inputs.forEach((el) => {
            el.disabled = !esDomicilio;
        });
        camposEnvio.style.opacity = esDomicilio ? '1' : '0.45';
    }

    if (!esDomicilio) {
        // Retiro en tienda: costo 0, limpiar campo visual
        estado.costoEnvio = 0;
        if (inputCostoEnvio) inputCostoEnvio.value = 'Sin costo (Retiro en tienda)';
        if (selectRegion)    selectRegion.value = '';
        actualizarTotales();
    } else {
        // Al volver a domicilio, recalcular desde region seleccionada
        estado.costoEnvio = 0;
        if (inputCostoEnvio) inputCostoEnvio.value = '';
        actualizarTotales();
    }
}

function calcularCostoEnvio() {
    if (!selectRegion) return;
    const opcionSeleccionada = selectRegion.options[selectRegion.selectedIndex];
    const costo = Number(opcionSeleccionada?.dataset?.costo || 0);
    estado.costoEnvio = costo;

    if (inputCostoEnvio) {
        inputCostoEnvio.value = costo > 0 ? formatearPrecio(costo) : '';
    }
    actualizarTotales();
}

// Listeners de tipo de despacho
if (opcionDomicilio) {
    opcionDomicilio.addEventListener('change', () => aplicarModoDespacho('domicilio'));
}
if (opcionRetiro) {
    opcionRetiro.addEventListener('change', () => aplicarModoDespacho('retiro'));
}

// Listener de region para calcular costo de envio dinamicamente
if (selectRegion) {
    selectRegion.addEventListener('change', calcularCostoEnvio);
}

// ─── API ─────────────────────────────────────────────────────────────────────
async function llamarApi(url, opciones = {}) {
    const headers = new Headers(opciones.headers || {});
    if (!(opciones.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
    }
    if (estado.token) {
        headers.set('Authorization', `Bearer ${estado.token}`);
    }
    const res = await fetch(url, { ...opciones, headers });
    const tipo = res.headers.get('content-type') || '';
    const datos = tipo.includes('application/json')
        ? await res.json()
        : { mensaje: await res.text() };
    if (!res.ok) throw new Error(datos.mensaje || 'Error en la peticion.');
    return datos;
}

// ─── Renderizado del carrito ──────────────────────────────────────────────────
function renderizarCarrito() {
    tablaCarrito.innerHTML = '';

    if (!estado.carrito.length) {
        const fila = document.createElement('tr');
        const celda = document.createElement('td');
        celda.colSpan = 7;
        celda.className = 'text-center py-4 text-muted';
        celda.textContent = 'Tu carrito está vacío.';
        fila.append(celda);
        tablaCarrito.append(fila);
        estado.subtotalProductos = 0;
        actualizarTotales();
        if (formPagoTarjeta) {
            const btnPagar = formPagoTarjeta.querySelector('button[type="submit"]');
            if (btnPagar) btnPagar.disabled = true;
        }
        return;
    }

    let subtotal = 0;

    estado.carrito.forEach((item) => {
        subtotal += Number(item.subtotal);

        const fila = document.createElement('tr');

        // Imagen
        const tdImg = document.createElement('td');
        const img = document.createElement('img');
        img.src = item.image_url || '/img/carburador.png';
        img.alt = item.name;
        img.style.cssText = 'width:70px;height:55px;object-fit:cover;border-radius:8px;';
        tdImg.append(img);

        // Nombre
        const tdNombre = document.createElement('td');
        tdNombre.className = 'fw-semibold';
        tdNombre.textContent = item.name;

        // Descripcion
        const tdDesc = document.createElement('td');
        tdDesc.className = 'small text-muted';
        tdDesc.style.maxWidth = '220px';
        tdDesc.textContent = item.description;

        // Cantidad
        const tdCant = document.createElement('td');
        tdCant.className = 'text-center';
        tdCant.textContent = item.quantity;

        // Precio unitario
        const tdPrecio = document.createElement('td');
        tdPrecio.className = 'text-end';
        tdPrecio.textContent = formatearPrecio(item.price);

        // Subtotal
        const tdSub = document.createElement('td');
        tdSub.className = 'text-end fw-bold';
        tdSub.textContent = formatearPrecio(item.subtotal);

        // Boton eliminar
        const tdAccion = document.createElement('td');
        const btnElim = document.createElement('button');
        btnElim.type = 'button';
        btnElim.className = 'btn btn-outline-danger btn-sm';
        btnElim.title = 'Quitar del carrito';
        btnElim.textContent = '✕';
        btnElim.addEventListener('click', async () => {
            try {
                await llamarApi(`/api/cart/${item.product_id}`, { method: 'DELETE' });
                await cargarCarrito();
                mostrarMensaje('Producto eliminado del carrito.', 'warning');
            } catch (err) {
                mostrarMensaje(err.message, 'danger');
            }
        });
        tdAccion.append(btnElim);

        fila.append(tdImg, tdNombre, tdDesc, tdCant, tdPrecio, tdSub, tdAccion);
        tablaCarrito.append(fila);
    });

    estado.subtotalProductos = subtotal;
    actualizarTotales();
}

// ─── Carga del carrito ────────────────────────────────────────────────────────
async function cargarCarrito() {
    estado.carrito = await llamarApi('/api/cart');
    renderizarCarrito();
}

// ─── Formulario de pago ───────────────────────────────────────────────────────
if (formPagoTarjeta) {
    formPagoTarjeta.addEventListener('submit', async (ev) => {
        ev.preventDefault();

        // Validar envio a domicilio si esta seleccionado
        if (opcionDomicilio?.checked) {
            const dir = document.getElementById('inputDireccion')?.value?.trim();
            const quien = document.getElementById('inputQuienRecibe')?.value?.trim();
            const region = selectRegion?.value;
            const comuna = document.getElementById('inputComuna')?.value?.trim();

            if (!dir || !quien || !region || !comuna) {
                mostrarMensaje('Debes completar todos los datos de envío a domicilio.', 'warning');
                return;
            }
            if (estado.costoEnvio === 0 && region) {
                mostrarMensaje('Selecciona una región para calcular el costo de envío.', 'warning');
                return;
            }
        }

        const fd = new FormData(formPagoTarjeta);
        try {
            const payload = {
                cardHolder:  obtenerTexto(fd, 'cardHolder'),
                cardNumber:  obtenerTexto(fd, 'cardNumber').replaceAll(/\s+/g, ''),
                expiryMonth: Number(obtenerTexto(fd, 'expiryMonth')),
                expiryYear:  Number(obtenerTexto(fd, 'expiryYear')),
                cvv:         obtenerTexto(fd, 'cvv'),
            };

            const resultado = await llamarApi('/api/cart/checkout', {
                method: 'POST',
                body: JSON.stringify(payload),
            });

            const totalFinal = formatearPrecio(resultado.resumen.total + estado.costoEnvio);
            if (respuestaPago) {
                respuestaPago.textContent =
                    `✅ Transacción ${resultado.pago.transaccionId} aprobada por ${totalFinal}.`;
            }
            mostrarMensaje('¡Pago aprobado! Serás redirigido a la tienda...', 'success');
            formPagoTarjeta.reset();
            await cargarCarrito();

            setTimeout(() => { window.location.href = '/'; }, 3000);

        } catch (err) {
            if (respuestaPago) {
                respuestaPago.textContent = '❌ El pago no pudo completarse. Verifica los datos.';
            }
            mostrarMensaje(err.message, 'danger');
        }
    });
}

// ─── Inicialización ───────────────────────────────────────────────────────────
async function iniciar() {
    if (!estado.token) {
        window.location.href = '/login.html';
        return;
    }
    try {
        await cargarCarrito();
        aplicarModoDespacho('domicilio'); // estado por defecto
        ocultarMensaje();
    } catch (err) {
        mostrarMensaje('Error al cargar el carrito: ' + err.message, 'danger');
    }
}

iniciar();
