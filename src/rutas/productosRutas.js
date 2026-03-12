const express = require('express');
const { autenticarJwt } = require('../middleware/autenticacionJwt');
const { autorizarAdministrador } = require('../middleware/autorizacionAdmin');
const { validarProducto, validarParametroProductId } = require('../middleware/validaciones');
const {
    obtenerProductos,
    crearNuevoProducto,
    modificarProducto,
    eliminarProductoExistente,
} = require('../controladores/productosControlador');

const router = express.Router();

router.get('/', autenticarJwt, obtenerProductos);
router.post('/', autenticarJwt, validarProducto, crearNuevoProducto);
router.put(
    '/:productId',
    autenticarJwt,
    autorizarAdministrador,
    validarParametroProductId,
    validarProducto,
    modificarProducto
);
router.delete('/:productId', autenticarJwt, autorizarAdministrador, validarParametroProductId, eliminarProductoExistente);

module.exports = router;
