function rutaNoEncontrada(req, res) {
    return res.status(404).json({ mensaje: 'Recurso no encontrado.' });
}

function manejoErrores(error, req, res, next) {
    console.error('Error no controlado:', error);

    if (res.headersSent) {
        return next(error);
    }

    return res.status(500).json({ mensaje: 'Error interno del servidor.' });
}

module.exports = {
    rutaNoEncontrada,
    manejoErrores,
};
