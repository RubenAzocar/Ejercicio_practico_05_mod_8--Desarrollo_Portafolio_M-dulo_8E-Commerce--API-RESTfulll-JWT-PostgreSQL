const { consulta } = require('../config/baseDatos');

async function obtenerUsuarioPorEmailOUsername(identificador) {
    const resultado = await consulta(
        'SELECT id, username, email, password_hash, role FROM users WHERE username = $1 OR email = $1 LIMIT 1;',
        [identificador]
    );

    return resultado.rows[0] || null;
}

async function existeUsuario(username, email) {
    const resultado = await consulta(
        'SELECT id FROM users WHERE username = $1 OR email = $2 LIMIT 1;',
        [username, email]
    );

    return Boolean(resultado.rows[0]);
}

async function crearUsuario({ username, email, passwordHash }) {
    const resultado = await consulta(
        "INSERT INTO users (username, email, password_hash, role) VALUES ($1, $2, $3, 'user') RETURNING id, username, email, role;",
        [username, email, passwordHash]
    );

    return resultado.rows[0];
}

module.exports = {
    obtenerUsuarioPorEmailOUsername,
    existeUsuario,
    crearUsuario,
};
