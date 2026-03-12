const jwt = require('jsonwebtoken');

function normalizarRol(role) {
    return role === 'admin' ? 'admin' : 'user';
}

function generarToken(datosUsuario) {
    const secreto = process.env.JWT_SECRET;

    if (!secreto) {
        throw new Error('Falta la variable JWT_SECRET en el entorno.');
    }

    const userId = Number(
        typeof datosUsuario === 'object' && datosUsuario !== null ? datosUsuario.userId : datosUsuario
    );

    if (!Number.isInteger(userId) || userId <= 0) {
        throw new Error('No fue posible generar el token: userId invalido.');
    }

    const role = normalizarRol(datosUsuario?.role);

    return jwt.sign({ user_id: userId, role }, secreto, {
        expiresIn: process.env.JWT_EXPIRES_IN || '8h',
    });
}

function verificarToken(token) {
    const secreto = process.env.JWT_SECRET;

    if (!secreto) {
        throw new Error('Falta la variable JWT_SECRET en el entorno.');
    }

    return jwt.verify(token, secreto);
}

module.exports = {
    generarToken,
    verificarToken,
};
