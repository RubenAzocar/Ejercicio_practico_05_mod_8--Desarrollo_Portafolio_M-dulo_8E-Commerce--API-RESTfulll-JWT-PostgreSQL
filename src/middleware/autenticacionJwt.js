const { verificarToken } = require('../utils/jwt');

function autenticarJwt(req, res, next) {
    const encabezado = req.headers.authorization || '';

    if (!encabezado.startsWith('Bearer ')) {
        return res.status(401).json({ mensaje: 'Token no proporcionado o formato invalido.' });
    }

    const token = encabezado.split(' ')[1];

    try {
        const payload = verificarToken(token);
        req.userId = Number(payload.user_id ?? payload.userId);
        req.userRole = payload.role === 'admin' ? 'admin' : 'user';

        if (!Number.isInteger(req.userId) || req.userId <= 0) {
            return res.status(401).json({ mensaje: 'Token invalido o expirado.' });
        }

        return next();
    } catch {
        return res.status(401).json({ mensaje: 'Token invalido o expirado.' });
    }
}

module.exports = {
    autenticarJwt,
};
