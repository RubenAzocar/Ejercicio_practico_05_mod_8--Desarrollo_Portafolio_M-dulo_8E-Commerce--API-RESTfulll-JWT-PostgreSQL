const express = require('express');
const authRutas = require('./authRutas');
const productosRutas = require('./productosRutas');
const carritoRutas = require('./carritoRutas');
const uploadRutas = require('./uploadRutas');

const router = express.Router();

router.use('/auth', authRutas);
router.use('/products', productosRutas);
router.use('/cart', carritoRutas);
router.use('/upload', uploadRutas);

module.exports = router;
