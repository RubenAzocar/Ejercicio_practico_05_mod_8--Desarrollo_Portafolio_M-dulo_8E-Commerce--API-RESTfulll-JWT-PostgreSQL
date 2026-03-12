const extensionesPermitidas = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const mimePermitidos = new Set(['image/jpeg', 'image/png', 'image/webp']);

function limpiarTexto(valor) {
    if (typeof valor !== 'string') {
        return '';
    }

    return valor.trim();
}

function esEnteroPositivo(valor) {
    return Number.isInteger(valor) && valor > 0;
}

function obtenerExtensionArchivo(nombreArchivo) {
    const indicePunto = nombreArchivo.lastIndexOf('.');
    return indicePunto >= 0 ? nombreArchivo.slice(indicePunto).toLowerCase() : '';
}

function validarRegistro(req, res, next) {
    const username = limpiarTexto(req.body.username);
    const email = limpiarTexto(req.body.email).toLowerCase();
    const password = limpiarTexto(req.body.password);

    if (!username || username.length < 3) {
        return res.status(400).json({ mensaje: 'El username debe tener al menos 3 caracteres.' });
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        return res.status(400).json({ mensaje: 'El email no tiene un formato valido.' });
    }

    if (!password || password.length < 6) {
        return res.status(400).json({ mensaje: 'La password debe tener al menos 6 caracteres.' });
    }

    req.body.username = username;
    req.body.email = email;
    req.body.password = password;
    return next();
}

function validarLogin(req, res, next) {
    const identificador = limpiarTexto(req.body.identificador || req.body.username || req.body.email);
    const password = limpiarTexto(req.body.password);

    if (!identificador || !password) {
        return res.status(400).json({ mensaje: 'Debes enviar identificador y password.' });
    }

    req.body.identificador = identificador;
    req.body.password = password;
    return next();
}

function validarCarrito(req, res, next) {
    const productId = Number(req.body.productId);
    const cantidadCruda = req.body.quantity ?? 1;
    const quantity = Number(cantidadCruda);

    if (!esEnteroPositivo(productId)) {
        return res.status(400).json({ mensaje: 'productId debe ser un entero positivo.' });
    }

    if (!esEnteroPositivo(quantity) || quantity > 99) {
        return res.status(400).json({ mensaje: 'quantity debe ser un entero entre 1 y 99.' });
    }

    req.body.productId = productId;
    req.body.quantity = quantity;
    return next();
}

function validarParametroProductId(req, res, next) {
    const productId = Number(req.params.productId);

    if (!esEnteroPositivo(productId)) {
        return res.status(400).json({ mensaje: 'productId debe ser un entero positivo.' });
    }

    req.params.productId = String(productId);
    return next();
}

function validarProducto(req, res, next) {
    const nombre = limpiarTexto(req.body.name);
    const descripcion = limpiarTexto(req.body.description);
    const precio = Number(req.body.price);
    const imageUrl = limpiarTexto(req.body.imageUrl);

    if (!nombre || nombre.length < 3 || nombre.length > 120) {
        return res.status(400).json({ mensaje: 'El nombre del producto debe tener entre 3 y 120 caracteres.' });
    }

    if (!descripcion || descripcion.length < 10 || descripcion.length > 1000) {
        return res.status(400).json({ mensaje: 'La descripcion del producto debe tener entre 10 y 1000 caracteres.' });
    }

    if (!Number.isFinite(precio) || precio <= 0) {
        return res.status(400).json({ mensaje: 'El precio debe ser un numero mayor a 0.' });
    }

    const rutaImagenValida = imageUrl?.startsWith('/uploads/') || imageUrl?.startsWith('/img/');
    if (!rutaImagenValida) {
        return res.status(400).json({ mensaje: 'Debes subir primero una imagen valida para el producto.' });
    }

    req.body.name = nombre;
    req.body.description = descripcion;
    req.body.price = Number(precio.toFixed(2));
    req.body.imageUrl = imageUrl;
    return next();
}

function validarPagoTarjeta(req, res, next) {
    const cardHolder = limpiarTexto(req.body.cardHolder);
    const cardNumber = limpiarTexto(req.body.cardNumber).replaceAll(/\s+/g, '');
    const expiryMonth = Number(req.body.expiryMonth);
    const expiryYear = Number(req.body.expiryYear);
    const cvv = limpiarTexto(req.body.cvv);

    if (!cardHolder || cardHolder.length < 5 || cardHolder.length > 120) {
        return res.status(400).json({ mensaje: 'El titular de la tarjeta debe tener entre 5 y 120 caracteres.' });
    }

    if (!/^\d{13,19}$/.test(cardNumber)) {
        return res.status(400).json({ mensaje: 'El numero de tarjeta debe tener entre 13 y 19 digitos.' });
    }

    if (!Number.isInteger(expiryMonth) || expiryMonth < 1 || expiryMonth > 12) {
        return res.status(400).json({ mensaje: 'El mes de expiracion debe estar entre 1 y 12.' });
    }

    const fechaActual = new Date();
    const anioActual = fechaActual.getFullYear();
    const mesActual = fechaActual.getMonth() + 1;

    if (!Number.isInteger(expiryYear) || expiryYear < anioActual || expiryYear > anioActual + 20) {
        return res.status(400).json({ mensaje: 'El anio de expiracion no es valido.' });
    }

    if (expiryYear === anioActual && expiryMonth < mesActual) {
        return res.status(400).json({ mensaje: 'La tarjeta se encuentra expirada.' });
    }

    if (!/^\d{3,4}$/.test(cvv)) {
        return res.status(400).json({ mensaje: 'El CVV debe tener 3 o 4 digitos.' });
    }

    req.body.cardHolder = cardHolder;
    req.body.cardNumber = cardNumber;
    req.body.expiryMonth = expiryMonth;
    req.body.expiryYear = expiryYear;
    req.body.cvv = cvv;
    return next();
}

function validarSubida(req, res, next) {
    if (!req.files?.imagen) {
        return res.status(400).json({ mensaje: 'Debes adjuntar un archivo en el campo imagen.' });
    }

    const archivo = req.files.imagen;
    if (Array.isArray(archivo)) {
        return res.status(400).json({ mensaje: 'Solo se permite subir una imagen por solicitud.' });
    }

    const extension = obtenerExtensionArchivo(archivo.name);
    const mimeArchivo = limpiarTexto(archivo.mimetype).toLowerCase();

    if (!extensionesPermitidas.has(extension)) {
        return res.status(400).json({ mensaje: 'Solo se permiten archivos JPG, PNG o WEBP.' });
    }

    if (!mimePermitidos.has(mimeArchivo)) {
        return res.status(400).json({ mensaje: 'El tipo de archivo no es valido.' });
    }

    return next();
}

module.exports = {
    validarRegistro,
    validarLogin,
    validarCarrito,
    validarParametroProductId,
    validarProducto,
    validarPagoTarjeta,
    validarSubida,
};
