const bcrypt = require('bcryptjs');
const { crearUsuario, existeUsuario, obtenerUsuarioPorEmailOUsername } = require('../modelos/usuarioModelo');
const { generarToken } = require('../utils/jwt');

async function registrarUsuario(req, res, next) {
    try {
        const { username, email, password } = req.body;

        const usuarioExiste = await existeUsuario(username, email);
        if (usuarioExiste) {
            return res.status(400).json({ mensaje: 'El username o email ya se encuentra registrado.' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const usuarioCreado = await crearUsuario({ username, email, passwordHash });

        return res.status(201).json({
            mensaje: 'Usuario registrado correctamente.',
            usuario: usuarioCreado,
        });
    } catch (error) {
        return next(error);
    }
}

async function iniciarSesion(req, res, next) {
    try {
        const { identificador, password } = req.body;
        const usuario = await obtenerUsuarioPorEmailOUsername(identificador);

        if (!usuario) {
            return res.status(401).json({ mensaje: 'Credenciales invalidas.' });
        }

        const coincidePassword = await bcrypt.compare(password, usuario.password_hash);
        if (!coincidePassword) {
            return res.status(401).json({ mensaje: 'Credenciales invalidas.' });
        }

        const token = generarToken({ userId: usuario.id, role: usuario.role });

        return res.status(200).json({
            token,
            role: usuario.role,
            username: usuario.username,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    registrarUsuario,
    iniciarSesion,
};
