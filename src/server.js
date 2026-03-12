require('dotenv').config();

const fs = require('node:fs');
const path = require('node:path');
const { app } = require('./app');
const { inicializarBaseDatos } = require('./config/baseDatos');

const puerto = Number(process.env.PORT) || 3000;
const rutaUploads = path.join(process.cwd(), 'uploads');

if (!fs.existsSync(rutaUploads)) {
    fs.mkdirSync(rutaUploads, { recursive: true });
}

async function iniciarServidor() {
    try {
        await inicializarBaseDatos();
        app.listen(puerto, () => {
            console.log(`Servidor escuchando en http://localhost:${puerto}`);
        });
    } catch (error) {
        const detalleError = error?.message?.trim() || String(error);
        console.error('No se pudo iniciar la aplicacion:', detalleError);

        if (Array.isArray(error?.errors)) {
            error.errors.forEach((causa) => {
                const detalleCausa = causa?.message?.trim() || String(causa);
                console.error('Causa:', detalleCausa);
            });
        }

        process.exit(1);
    }
}

// eslint-disable-next-line unicorn/prefer-top-level-await
iniciarServidor();
