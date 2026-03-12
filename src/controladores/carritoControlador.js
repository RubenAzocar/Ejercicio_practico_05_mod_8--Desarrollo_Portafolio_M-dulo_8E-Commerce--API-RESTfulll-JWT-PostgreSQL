const {
    agregarOActualizarCarrito,
    obtenerCarrito,
    eliminarProductoDelCarrito,
    vaciarCarrito,
} = require('../modelos/carritoModelo');
const { obtenerProductoPorId } = require('../modelos/productoModelo');
const { simularPagoTarjeta } = require('../utils/pagoTarjeta');

function calcularTotalCarrito(items) {
    const total = items.reduce((acumulado, item) => acumulado + Number(item.subtotal), 0);
    return Number(total.toFixed(2));
}

async function agregarAlCarrito(req, res, next) {
    try {
        const { productId, quantity } = req.body;

        const producto = await obtenerProductoPorId(productId);
        if (!producto) {
            return res.status(404).json({ mensaje: 'Producto no encontrado.' });
        }

        await agregarOActualizarCarrito(req.userId, productId, quantity);

        return res.status(201).json({ mensaje: 'Producto agregado al carrito.' });
    } catch (error) {
        return next(error);
    }
}

async function obtenerCarritoUsuario(req, res, next) {
    try {
        const items = await obtenerCarrito(req.userId);
        return res.status(200).json(items);
    } catch (error) {
        return next(error);
    }
}

async function eliminarDelCarrito(req, res, next) {
    try {
        const productId = Number(req.params.productId);

        if (!Number.isInteger(productId) || productId <= 0) {
            return res.status(400).json({ mensaje: 'productId debe ser un entero positivo.' });
        }

        const filasEliminadas = await eliminarProductoDelCarrito(req.userId, productId);
        if (!filasEliminadas) {
            return res.status(404).json({ mensaje: 'El producto no existe en el carrito.' });
        }

        return res.status(200).json({ mensaje: 'Producto eliminado del carrito.' });
    } catch (error) {
        return next(error);
    }
}

async function procesarPagoCarrito(req, res, next) {
    try {
        const items = await obtenerCarrito(req.userId);

        if (!items.length) {
            return res.status(400).json({ mensaje: 'No puedes pagar un carrito vacio.' });
        }

        const total = calcularTotalCarrito(items);
        const resultadoPago = simularPagoTarjeta({
            cardNumber: req.body.cardNumber,
            cardHolder: req.body.cardHolder,
            expiryMonth: req.body.expiryMonth,
            expiryYear: req.body.expiryYear,
            amount: total,
        });

        if (!resultadoPago.aprobado) {
            return res.status(402).json({
                mensaje: resultadoPago.mensaje,
                codigo: resultadoPago.codigo,
            });
        }

        await vaciarCarrito(req.userId);

        return res.status(200).json({
            mensaje: 'Pago realizado correctamente. El carrito fue vaciado.',
            pago: resultadoPago,
            resumen: {
                cantidadItems: items.length,
                total,
            },
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    agregarAlCarrito,
    obtenerCarritoUsuario,
    eliminarDelCarrito,
    procesarPagoCarrito,
};
