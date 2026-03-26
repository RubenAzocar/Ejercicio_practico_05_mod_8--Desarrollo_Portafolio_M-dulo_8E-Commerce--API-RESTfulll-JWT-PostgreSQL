/**
 * checkout.js — Script exclusivo para la pagina de pago (checkout.html)
 * Maneja: autenticacion, carga del carrito, renderizado y simulacion de pago.
 */

const estado = {
    token: localStorage.getItem('token') || '',
    rol: 'user',
    carrito: [],
};

// ─── Elementos del DOM ───────────────────────────────────────────────────────
const tablaCarrito      = document.getElementById('tablaCarrito');
const totalCarrito      = document.getElementById('totalCarrito');
const contenedorMensajes = document.getElementById('contenedorMensajes');
const formPagoTarjeta   = document.getElementById('formPagoTarjeta');
const respuestaPago     = document.getElementById('respuestaPagoTarjeta');

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
        totalCarrito.textContent = formatearPrecio(0);
        if (formPagoTarjeta) {
            formPagoTarjeta.querySelector('button[type="submit"]').disabled = true;
        }
        return;
    }

    let total = 0;

    estado.carrito.forEach((item) => {
        total += Number(item.subtotal);

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

    totalCarrito.textContent = formatearPrecio(total);
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

            if (respuestaPago) {
                respuestaPago.textContent =
                    `✅ Transacción ${resultado.pago.transaccionId} aprobada por ${formatearPrecio(resultado.resumen.total)}.`;
            }
            mostrarMensaje('¡Pago aprobado! Serás redirigido a la tienda...', 'success');
            formPagoTarjeta.reset();
            await cargarCarrito(); // actualiza tabla (quedará vacía)

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
        ocultarMensaje();
    } catch (err) {
        mostrarMensaje('Error al cargar el carrito: ' + err.message, 'danger');
    }
}

iniciar();
