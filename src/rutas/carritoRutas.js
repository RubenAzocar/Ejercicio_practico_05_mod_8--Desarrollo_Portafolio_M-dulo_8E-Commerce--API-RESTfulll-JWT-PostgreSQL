const express = require('express');
const { autenticarJwt } = require('../middleware/autenticacionJwt');
const { validarCarrito, validarPagoTarjeta } = require('../middleware/validaciones');
const {
    agregarAlCarrito,
    obtenerCarritoUsuario,
    eliminarDelCarrito,
    procesarPagoCarrito,
} = require('../controladores/carritoControlador');

const router = express.Router();

router.post('/', autenticarJwt, validarCarrito, agregarAlCarrito);
router.post('/checkout', autenticarJwt, validarPagoTarjeta, procesarPagoCarrito);
router.get('/', autenticarJwt, obtenerCarritoUsuario);
router.delete('/:productId', autenticarJwt, eliminarDelCarrito);

module.exports = router;
