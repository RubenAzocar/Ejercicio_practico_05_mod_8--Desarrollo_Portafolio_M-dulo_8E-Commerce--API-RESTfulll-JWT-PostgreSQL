const {
    listarProductos,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
    obtenerProductoPorId,
} = require('../modelos/productoModelo');

async function obtenerProductos(req, res, next) {
    try {
        const productos = await listarProductos();
        return res.status(200).json(productos);
    } catch (error) {
        return next(error);
    }
}

async function crearNuevoProducto(req, res, next) {
    try {
        const producto = await crearProducto(req.body);
        return res.status(201).json({
            mensaje: 'Producto creado correctamente.',
            producto,
        });
    } catch (error) {
        if (error?.code === '23505') {
            return res.status(400).json({ mensaje: 'Ya existe un producto con ese nombre.' });
        }

        return next(error);
    }
}

async function modificarProducto(req, res, next) {
    try {
        const productId = Number(req.params.productId);
        const productoActual = await obtenerProductoPorId(productId);

        if (!productoActual) {
            return res.status(404).json({ mensaje: 'Producto no encontrado.' });
        }

        const productoActualizado = await actualizarProducto(productId, req.body);

        return res.status(200).json({
            mensaje: 'Producto actualizado correctamente.',
            producto: productoActualizado,
        });
    } catch (error) {
        if (error?.code === '23505') {
            return res.status(400).json({ mensaje: 'Ya existe un producto con ese nombre.' });
        }

        return next(error);
    }
}

async function eliminarProductoExistente(req, res, next) {
    try {
        const productId = Number(req.params.productId);
        const filasEliminadas = await eliminarProducto(productId);

        if (!filasEliminadas) {
            return res.status(404).json({ mensaje: 'Producto no encontrado.' });
        }

        return res.status(200).json({ mensaje: 'Producto eliminado correctamente.' });
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    obtenerProductos,
    crearNuevoProducto,
    modificarProducto,
    eliminarProductoExistente,
};
