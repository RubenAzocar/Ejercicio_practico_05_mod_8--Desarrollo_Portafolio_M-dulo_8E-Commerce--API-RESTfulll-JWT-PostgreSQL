const express = require('express');
const { autenticarJwt } = require('../middleware/autenticacionJwt');
const { autorizarAdministrador } = require('../middleware/autorizacionAdmin');
const { validarSubida } = require('../middleware/validaciones');
const { subirImagen } = require('../controladores/uploadControlador');

const router = express.Router();

router.post('/', autenticarJwt, autorizarAdministrador, validarSubida, subirImagen);

module.exports = router;
