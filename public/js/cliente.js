const estado = {
    token: localStorage.getItem('token') || '',
    rol: 'user',
    productos: [],
    carrito: [],
    edicionProducto: null,
};

const seccionAuth = document.getElementById('seccionAuth');
const seccionApp = document.getElementById('seccionApp');
const botonIrLogin = document.getElementById('botonIrLogin');
const botonLogout = document.getElementById('botonLogout');
const panelAdministrativo = document.getElementById('panelAdministrativo');
const contenedorMensajes = document.getElementById('contenedorMensajes');
const listaProductos = document.getElementById('listaProductos');
const tablaCarrito = document.getElementById('tablaCarrito');
const totalCarrito = document.getElementById('totalCarrito');
const botonIrPagar = document.getElementById('botonIrPagar');
const panelPagoTarjeta = document.getElementById('panelPagoTarjeta');
const formPagoTarjeta = document.getElementById('formPagoTarjeta');
const respuestaPagoTarjeta = document.getElementById('respuestaPagoTarjeta');
const respuestaUpload = document.getElementById('respuestaUpload');
const tituloFormularioProducto = document.getElementById('tituloFormularioProducto');
const botonGuardarProducto = document.getElementById('botonGuardarProducto');
const botonCancelarEdicion = document.getElementById('botonCancelarEdicion');
const inputNombreProducto = document.getElementById('inputNombreProducto');
const inputDescripcionProducto = document.getElementById('inputDescripcionProducto');
const inputPrecioProducto = document.getElementById('inputPrecioProducto');
const inputImagen = document.getElementById('inputImagen');
const botonElegirImagen = document.getElementById('botonElegirImagen');
const nombreArchivoSeleccionado = document.getElementById('nombreArchivoSeleccionado');

function decodificarPayloadToken(token) {
    try {
        if (!token || typeof token !== 'string') {
            return null;
        }

        const partes = token.split('.');
        if (partes.length !== 3) {
            return null;
        }

        const payloadBase64 = partes[1].replaceAll('-', '+').replaceAll('_', '/');
        const payloadJson = atob(payloadBase64);
        return JSON.parse(payloadJson);
    } catch {
        return null;
    }
}

function sincronizarRolDesdeToken() {
    const payload = decodificarPayloadToken(estado.token);
    estado.rol = payload?.role === 'admin' ? 'admin' : 'user';
}

function esAdministrador() {
    return estado.rol === 'admin';
}

function mostrarMensaje(texto, tipo = 'info') {
    contenedorMensajes.textContent = texto;
    contenedorMensajes.className = `alert alert-${tipo}`;
    contenedorMensajes.classList.remove('d-none');
}

function ocultarMensaje() {
    contenedorMensajes.classList.add('d-none');
}

function formatearPrecio(valor) {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        maximumFractionDigits: 0,
    }).format(Number(valor));
}

function obtenerCampoTexto(formData, nombreCampo) {
    const valor = formData.get(nombreCampo);
    return typeof valor === 'string' ? valor : '';
}

function normalizarCantidad(valor) {
    const cantidad = Number(valor);

    if (!Number.isInteger(cantidad) || cantidad < 1) {
        return 1;
    }

    if (cantidad > 99) {
        return 99;
    }

    return cantidad;
}

function limpiarSeleccionImagen() {
    if (nombreArchivoSeleccionado) {
        nombreArchivoSeleccionado.textContent = 'Ninguna imagen seleccionada para el nuevo producto.';
    }
}

function resetearFormularioProducto() {
    const formulario = document.getElementById('formUpload');
    if (!formulario) return;
    
    formulario.reset();
    estado.edicionProducto = null;
    
    if (tituloFormularioProducto) {
        tituloFormularioProducto.textContent = 'Nuevo Producto';
    }
    
    if (botonGuardarProducto) {
        botonGuardarProducto.textContent = 'Crear producto';
    }
    
    if (botonCancelarEdicion) {
        botonCancelarEdicion.classList.add('d-none');
    }
    
    if (respuestaUpload) {
        respuestaUpload.textContent = '';
    }
    
    limpiarSeleccionImagen();
}

function limpiarPanelPago() {
    if (formPagoTarjeta) {
        formPagoTarjeta.reset();
    }

    if (respuestaPagoTarjeta) {
        respuestaPagoTarjeta.textContent = '';
    }
}

function actualizarEstadoPago() {
    if (!botonIrPagar || !panelPagoTarjeta) {
        return;
    }

    const hayItems = estado.carrito.length > 0;
    botonIrPagar.disabled = !hayItems;

    if (!hayItems) {
        panelPagoTarjeta.classList.add('d-none');
        botonIrPagar.textContent = 'Ir a pagar';
        limpiarPanelPago();
    }
}

function activarModoEdicionProducto(producto) {
    if (!esAdministrador()) {
        mostrarMensaje('Solo un administrador puede editar productos.', 'warning');
        return;
    }

    estado.edicionProducto = producto;
    tituloFormularioProducto.textContent = `Editar Producto #${producto.id}`;
    botonGuardarProducto.textContent = 'Guardar cambios';
    botonCancelarEdicion.classList.remove('d-none');

    inputNombreProducto.value = producto.name;
    inputDescripcionProducto.value = producto.description;
    inputPrecioProducto.value = Number(producto.price);
    inputImagen.value = '';
    nombreArchivoSeleccionado.textContent = 'Mantendras la imagen actual si no seleccionas otra nueva.';

    document.getElementById('formUpload').scrollIntoView({ behavior: 'smooth', block: 'center' });
}

async function llamarApi(url, opciones = {}) {
    const headers = new Headers(opciones.headers || {});

    if (!(opciones.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
    }

    if (estado.token) {
        headers.set('Authorization', `Bearer ${estado.token}`);
    }

    const respuesta = await fetch(url, {
        ...opciones,
        headers,
    });

    const tipoContenido = respuesta.headers.get('content-type') || '';
    const datos = tipoContenido.includes('application/json')
        ? await respuesta.json()
        : { mensaje: await respuesta.text() };

    if (!respuesta.ok) {
        throw new Error(datos.mensaje || 'Ocurrio un error en la peticion.');
    }

    return datos;
}

function actualizarVistaSesion() {
    const logueado = Boolean(estado.token);
    const admin = esAdministrador();

    // En index.html
    if (seccionApp) {
        seccionApp.classList.remove('d-none');
        seccionApp.classList.toggle('vista-invitado', !logueado);
    }

    if (botonIrLogin) {
        botonIrLogin.classList.toggle('d-none', logueado);
    }

    if (botonLogout) {
        botonLogout.classList.toggle('d-none', !logueado);
    }

    if (panelAdministrativo) {
        panelAdministrativo.classList.toggle('d-none', !admin);
    }

    // En login.html (si existe la seccion)
    if (seccionAuth) {
        seccionAuth.classList.toggle('d-none', logueado);
        if (logueado && window.location.pathname.includes('login.html')) {
            window.location.href = '/';
        }
    }
}

function crearTarjetaProducto(producto) {
    const columna = document.createElement('div');
    columna.className = 'col-md-6';

    const tarjeta = document.createElement('article');
    tarjeta.className = 'tarjeta-producto';

    const imagen = document.createElement('img');
    imagen.src = producto.image_url || '/img/carburador.png';
    imagen.alt = producto.name;
    imagen.loading = 'lazy';

    const contenido = document.createElement('div');
    contenido.className = 'contenido';

    const nombre = document.createElement('h3');
    nombre.className = 'nombre-producto';
    nombre.textContent = producto.name;

    const descripcion = document.createElement('p');
    descripcion.className = 'descripcion-producto';
    descripcion.textContent = producto.description;

    const precio = document.createElement('p');
    precio.className = 'precio-producto';
    precio.textContent = formatearPrecio(producto.price);

    const contenedorAcciones = document.createElement('div');
    contenedorAcciones.className = 'd-flex gap-2 mt-auto';

    const contenedorGestion = document.createElement('div');
    contenedorGestion.className = 'd-flex gap-2 mt-2';

    const cantidad = document.createElement('input');
    cantidad.type = 'number';
    cantidad.min = '1';
    cantidad.max = '99';
    cantidad.value = '1';
    cantidad.className = 'form-control form-control-sm';

    const botonAgregar = document.createElement('button');
    botonAgregar.type = 'button';
    botonAgregar.className = 'btn btn-vintage btn-sm';
    botonAgregar.textContent = 'Agregar';
    botonAgregar.dataset.productoId = String(producto.id);

    const botonEditar = document.createElement('button');
    botonEditar.type = 'button';
    botonEditar.className = 'btn btn-outline-secondary btn-sm';
    botonEditar.textContent = 'Editar';

    const botonEliminar = document.createElement('button');
    botonEliminar.type = 'button';
    botonEliminar.className = 'btn btn-outline-danger btn-sm';
    botonEliminar.textContent = 'Eliminar';

    contenedorAcciones.append(cantidad, botonAgregar);
    contenido.append(nombre, descripcion, precio, contenedorAcciones);

    if (esAdministrador()) {
        contenedorGestion.append(botonEditar, botonEliminar);
        contenido.append(contenedorGestion);
    }

    tarjeta.append(imagen, contenido);
    columna.append(tarjeta);

    botonAgregar.addEventListener('click', async () => {
        try {
            const quantity = normalizarCantidad(cantidad.value);
            cantidad.value = String(quantity);

            await llamarApi('/api/cart', {
                method: 'POST',
                body: JSON.stringify({ productId: producto.id, quantity }),
            });
            mostrarMensaje('Producto agregado al carrito.', 'success');
            await cargarCarrito();
        } catch (error) {
            mostrarMensaje(error.message, 'danger');
        }
    });

    if (esAdministrador()) {
        botonEditar.addEventListener('click', () => {
            activarModoEdicionProducto(producto);
        });

        botonEliminar.addEventListener('click', async () => {
            try {
                const confirmar = confirm(`¿Eliminar el producto "${producto.name}"?`);
                if (!confirmar) {
                    return;
                }

                await llamarApi(`/api/products/${producto.id}`, {
                    method: 'DELETE',
                });

                if (estado.edicionProducto?.id === producto.id) {
                    resetearFormularioProducto();
                }

                await Promise.all([cargarProductos(), cargarCarrito()]);
                mostrarMensaje('Producto eliminado correctamente.', 'warning');
            } catch (error) {
                mostrarMensaje(error.message, 'danger');
            }
        });
    }

    return columna;
}

function renderizarProductos() {
    if (!listaProductos) return;
    listaProductos.innerHTML = '';

    if (!estado.productos.length) {
        const vacio = document.createElement('p');
        vacio.className = 'mb-0 text-muted';
        vacio.textContent = 'No hay productos disponibles actualmente.';
        listaProductos.append(vacio);
        return;
    }

    const fragmento = document.createDocumentFragment();
    estado.productos.forEach((producto) => {
        fragmento.append(crearTarjetaProducto(producto));
    });

    listaProductos.append(fragmento);
}

function renderizarCarrito() {
    if (!tablaCarrito || !totalCarrito) return;
    tablaCarrito.innerHTML = '';

    if (!estado.carrito.length) {
        const fila = document.createElement('tr');
        const celda = document.createElement('td');
        celda.colSpan = 4;
        celda.className = 'text-center py-3 text-muted';
        celda.textContent = 'Tu carrito se encuentra vacio.';
        fila.append(celda);
        tablaCarrito.append(fila);
        totalCarrito.textContent = formatearPrecio(0);
        actualizarEstadoPago();
        return;
    }

    let total = 0;

    estado.carrito.forEach((item) => {
        total += Number(item.subtotal);

        const fila = document.createElement('tr');
        fila.className = 'fila-carrito';

        const celdaProducto = document.createElement('td');
        celdaProducto.textContent = item.name;

        const celdaCantidad = document.createElement('td');
        celdaCantidad.textContent = String(item.quantity);

        const celdaSubtotal = document.createElement('td');
        celdaSubtotal.className = 'text-end';
        celdaSubtotal.textContent = formatearPrecio(item.subtotal);

        const celdaAccion = document.createElement('td');
        const botonEliminar = document.createElement('button');
        botonEliminar.type = 'button';
        botonEliminar.className = 'btn btn-outline-danger btn-sm';
        botonEliminar.textContent = 'X';
        botonEliminar.title = 'Eliminar del carrito';
        botonEliminar.addEventListener('click', async () => {
            try {
                await llamarApi(`/api/cart/${item.product_id}`, { method: 'DELETE' });
                mostrarMensaje('Producto eliminado del carrito.', 'warning');
                await cargarCarrito();
            } catch (error) {
                mostrarMensaje(error.message, 'danger');
            }
        });

        celdaAccion.append(botonEliminar);
        fila.append(celdaProducto, celdaCantidad, celdaSubtotal, celdaAccion);
        tablaCarrito.append(fila);
    });

    totalCarrito.textContent = formatearPrecio(total);
    actualizarEstadoPago();
}

async function cargarProductos() {
    estado.productos = await llamarApi('/api/products');
    renderizarProductos();
}

async function cargarCarrito() {
    estado.carrito = await llamarApi('/api/cart');
    renderizarCarrito();
}

async function iniciarPanelPrivado() {
    sincronizarRolDesdeToken();
    actualizarVistaSesion();

    try {
        await cargarProductos();
        if (estado.token) {
            await cargarCarrito();
        }
        ocultarMensaje();
    } catch (error) {
        if (estado.token) {
            localStorage.removeItem('token');
            estado.token = '';
            estado.rol = 'user';
            actualizarVistaSesion();
            mostrarMensaje(error.message, 'danger');
        }
    }
}

const formRegistro = document.getElementById('formRegistro');
if (formRegistro) {
    formRegistro.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        const formulario = evento.currentTarget;

        const datosFormulario = new FormData(formulario);
        const payload = {
            username: obtenerCampoTexto(datosFormulario, 'username'),
            email: obtenerCampoTexto(datosFormulario, 'email'),
            password: obtenerCampoTexto(datosFormulario, 'password'),
        };

        try {
            await llamarApi('/api/auth/register', {
                method: 'POST',
                body: JSON.stringify(payload),
            });
            mostrarMensaje('Registro exitoso. Ahora puedes iniciar sesion.', 'success');
            formulario.reset();
        } catch (error) {
            mostrarMensaje(error.message, 'danger');
        }
    });
}

const formLogin = document.getElementById('formLogin');
if (formLogin) {
    formLogin.addEventListener('submit', async (evento) => {
        evento.preventDefault();
        const formulario = evento.currentTarget;

        const datosFormulario = new FormData(formulario);
        const payload = {
            identificador: obtenerCampoTexto(datosFormulario, 'identificador'),
            password: obtenerCampoTexto(datosFormulario, 'password'),
        };

        try {
            const respuesta = await llamarApi('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify(payload),
            });

            estado.token = respuesta.token;
            estado.rol = respuesta.role === 'admin' ? 'admin' : 'user';
            if (!respuesta.role) {
                sincronizarRolDesdeToken();
            }
            localStorage.setItem('token', respuesta.token);
            mostrarMensaje('Sesion iniciada correctamente. Redirigiendo...', 'success');
            formulario.reset();
            
            // Redirigir si estamos en la pagina de login
            if (window.location.pathname.includes('login.html')) {
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            } else {
                await iniciarPanelPrivado();
            }
        } catch (error) {
            mostrarMensaje(error.message, 'danger');
        }
    });
}

document.getElementById('botonLogout').addEventListener('click', () => {
    estado.token = '';
    estado.rol = 'user';
    estado.carrito = [];
    localStorage.removeItem('token');
    actualizarVistaSesion();
    renderizarCarrito();
    listaProductos.innerHTML = '';
    resetearFormularioProducto();
    limpiarPanelPago();
    if (panelPagoTarjeta) {
        panelPagoTarjeta.classList.add('d-none');
    }
    if (botonIrPagar) {
        botonIrPagar.textContent = 'Ir a pagar';
        botonIrPagar.disabled = true;
    }
    mostrarMensaje('Has cerrado sesion.', 'warning');
});

botonCancelarEdicion.addEventListener('click', () => {
    resetearFormularioProducto();
    mostrarMensaje('Edicion cancelada.', 'info');
});

if (botonElegirImagen && inputImagen) {
    botonElegirImagen.addEventListener('click', () => {
        inputImagen.click();
    });

    inputImagen.addEventListener('change', () => {
        const archivo = inputImagen.files?.[0];
        nombreArchivoSeleccionado.textContent = archivo
            ? `Imagen seleccionada: ${archivo.name}`
            : 'Ninguna imagen seleccionada para el nuevo producto.';
    });
}

document.getElementById('botonRecargarProductos').addEventListener('click', async () => {
    try {
        await Promise.all([cargarProductos(), cargarCarrito()]);
        mostrarMensaje('Informacion actualizada.', 'success');
    } catch (error) {
        mostrarMensaje(error.message, 'danger');
    }
});

if (botonIrPagar && panelPagoTarjeta) {
    botonIrPagar.addEventListener('click', () => {
        const estaOculto = panelPagoTarjeta.classList.contains('d-none');
        panelPagoTarjeta.classList.toggle('d-none', !estaOculto);
        botonIrPagar.textContent = estaOculto ? 'Ocultar pago' : 'Ir a pagar';
    });
}

if (formPagoTarjeta) {
    formPagoTarjeta.addEventListener('submit', async (evento) => {
        evento.preventDefault();

        try {
            const datosFormulario = new FormData(formPagoTarjeta);
            const payloadPago = {
                cardHolder: obtenerCampoTexto(datosFormulario, 'cardHolder'),
                cardNumber: obtenerCampoTexto(datosFormulario, 'cardNumber').replaceAll(/\s+/g, ''),
                expiryMonth: Number(obtenerCampoTexto(datosFormulario, 'expiryMonth')),
                expiryYear: Number(obtenerCampoTexto(datosFormulario, 'expiryYear')),
                cvv: obtenerCampoTexto(datosFormulario, 'cvv'),
            };

            const respuestaPago = await llamarApi('/api/cart/checkout', {
                method: 'POST',
                body: JSON.stringify(payloadPago),
            });

            respuestaPagoTarjeta.textContent = `Transaccion ${respuestaPago.pago.transaccionId} aprobada por ${formatearPrecio(respuestaPago.resumen.total)}.`;
            mostrarMensaje('Pago aprobado. Tu carrito fue vaciado.', 'success');

            await Promise.all([cargarCarrito(), cargarProductos()]);

            panelPagoTarjeta.classList.add('d-none');
            botonIrPagar.textContent = 'Ir a pagar';
            limpiarPanelPago();
        } catch (error) {
            respuestaPagoTarjeta.textContent = 'El pago no se pudo completar en la simulacion.';
            mostrarMensaje(error.message, 'danger');
        }
    });
}

document.getElementById('formUpload').addEventListener('submit', async (evento) => {
    evento.preventDefault();
    const esEdicion = Boolean(estado.edicionProducto);

    try {
        if (esEdicion && !esAdministrador()) {
            throw new Error('Solo un administrador puede modificar productos.');
        }

        if (!inputNombreProducto.value.trim()) {
            throw new Error('Debes ingresar el nombre del producto.');
        }

        if (!inputDescripcionProducto.value.trim()) {
            throw new Error('Debes ingresar la descripcion del producto.');
        }

        const precio = Number(inputPrecioProducto.value);
        if (!Number.isFinite(precio) || precio <= 0) {
            throw new Error('Debes ingresar un precio valido mayor a 0.');
        }

        let imageUrl = estado.edicionProducto?.image_url || '';

        if (inputImagen.files?.[0]) {
            const datosImagen = new FormData();
            datosImagen.append('imagen', inputImagen.files[0]);

            const respuestaUploadApi = await llamarApi('/api/upload', {
                method: 'POST',
                body: datosImagen,
            });

            imageUrl = respuestaUploadApi.ruta;
            respuestaUpload.textContent = `Imagen asignada: ${respuestaUploadApi.ruta}`;
        }

        if (!imageUrl) {
            throw new Error('Debes seleccionar una imagen para el producto.');
        }

        const payloadProducto = {
            name: inputNombreProducto.value.trim(),
            description: inputDescripcionProducto.value.trim(),
            price: precio,
            imageUrl,
        };

        const endpoint = esEdicion
            ? `/api/products/${estado.edicionProducto.id}`
            : '/api/products';
        const metodo = esEdicion ? 'PUT' : 'POST';

        await llamarApi(endpoint, {
            method: metodo,
            body: JSON.stringify(payloadProducto),
        });

        await Promise.all([cargarProductos(), cargarCarrito()]);

        mostrarMensaje(esEdicion ? 'Producto actualizado correctamente.' : 'Producto creado correctamente.', 'success');
        resetearFormularioProducto();
    } catch (error) {
        respuestaUpload.textContent = '';
        mostrarMensaje(error.message, 'danger');
    }
});

function iniciarAplicacion() {
    sincronizarRolDesdeToken();
    iniciarPanelPrivado().catch((error) => {
        mostrarMensaje(error.message, 'danger');
    });

    // Delegacion de eventos para clics en paneles de invitado
    document.addEventListener('click', (evento) => {
        const elementoBloqueado = evento.target.closest('.vista-invitado');
        if (elementoBloqueado && !estado.token) {
            mostrarAvisoRegistro();
        }
    });
}

function mostrarAvisoRegistro() {
    contenedorMensajes.innerHTML = `
        <div class="d-flex flex-column flex-md-row align-items-center justify-content-center gap-3">
            <span>Para interactuar con la tienda debes registrarte o iniciar sesion.</span>
            <button class="btn btn-warning btn-sm" id="btnRedirigirLogin">Ir a Registro / Login</button>
        </div>
    `;
    contenedorMensajes.className = 'alert alert-info py-3 shadow-sm';
    contenedorMensajes.classList.remove('d-none');
    contenedorMensajes.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Listener especifico para el boton recien creado
    const botonRedirigir = document.getElementById('btnRedirigirLogin');
    if (botonRedirigir) {
        botonRedirigir.addEventListener('click', (ej) => {
            ej.preventDefault();
            window.location.href = '/login.html';
        });
    }
}

iniciarAplicacion();
