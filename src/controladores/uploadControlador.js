const path = require('node:path');
const crypto = require('node:crypto');

const carpetaUploads = path.join(process.cwd(), 'uploads');

async function subirImagen(req, res, next) {
    try {
        if (!req.files?.imagen || Array.isArray(req.files.imagen)) {
            return res.status(400).json({ mensaje: 'Debes enviar una unica imagen valida.' });
        }

        const archivo = req.files.imagen;
        const extension = path.extname(archivo.name).toLowerCase();
        const nombreArchivo = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${extension}`;
        const rutaDestino = path.join(carpetaUploads, nombreArchivo);

        await archivo.mv(rutaDestino);

        return res.status(201).json({
            nombreOriginal: archivo.name,
            nombre: nombreArchivo,
            ruta: `/uploads/${nombreArchivo}`,
        });
    } catch (error) {
        return next(error);
    }
}

module.exports = {
    subirImagen,
};
