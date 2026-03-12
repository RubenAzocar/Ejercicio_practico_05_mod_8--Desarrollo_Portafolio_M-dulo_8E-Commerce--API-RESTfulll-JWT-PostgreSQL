function autorizarAdministrador(req, res, next) {
    if (req.userRole !== 'admin') {
        return res.status(403).json({ mensaje: 'Solo un administrador puede realizar esta accion.' });
    }

    return next();
}

module.exports = {
    autorizarAdministrador,
};
