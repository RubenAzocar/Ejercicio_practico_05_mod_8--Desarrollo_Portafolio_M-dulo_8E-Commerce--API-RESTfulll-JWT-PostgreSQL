const express = require('express');
const { autenticarJwt } = require('../middleware/autenticacionJwt');
const { validarSubida } = require('../middleware/validaciones');
const { subirImagen } = require('../controladores/uploadControlador');

const router = express.Router();

router.post('/', autenticarJwt, validarSubida, subirImagen);

module.exports = router;
