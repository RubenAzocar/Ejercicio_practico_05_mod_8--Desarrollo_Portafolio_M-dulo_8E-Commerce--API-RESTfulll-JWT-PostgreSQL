const express = require('express');
const { registrarUsuario, iniciarSesion } = require('../controladores/authControlador');
const { validarRegistro, validarLogin } = require('../middleware/validaciones');

const router = express.Router();

router.post('/register', validarRegistro, registrarUsuario);
router.post('/login', validarLogin, iniciarSesion);

module.exports = router;
