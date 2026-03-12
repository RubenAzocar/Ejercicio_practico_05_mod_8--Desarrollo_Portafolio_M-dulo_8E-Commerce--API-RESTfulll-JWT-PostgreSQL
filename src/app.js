const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const fileUpload = require('express-fileupload');
const path = require('node:path');

const rutasApi = require('./rutas');
const { rutaNoEncontrada, manejoErrores } = require('./middleware/manejoErrores');

const app = express();

app.use(
    helmet({
        contentSecurityPolicy: {
            useDefaults: true,
            directives: {
                'default-src': ["'self'"],
                'script-src': ["'self'", 'https://cdn.jsdelivr.net'],
                'style-src': ["'self'", 'https://cdn.jsdelivr.net', 'https://fonts.googleapis.com'],
                'font-src': ["'self'", 'https://fonts.gstatic.com'],
                'img-src': ["'self'", 'data:', 'https:'],
            },
        },
        crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
);

app.use(
    cors({
        origin: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    })
);

app.use(express.json({ limit: '500kb' }));
app.use(express.urlencoded({ extended: true }));

const maxUploadMb = Number(process.env.MAX_UPLOAD_MB || 3);
app.use(
    fileUpload({
        limits: { fileSize: maxUploadMb * 1024 * 1024 },
        abortOnLimit: true,
        safeFileNames: true,
        preserveExtension: true,
        createParentPath: true,
    })
);

app.use(express.static(path.join(process.cwd(), 'public')));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/api/salud', (req, res) => {
    return res.status(200).json({ estado: 'ok' });
});

app.use('/api', rutasApi);
app.use(rutaNoEncontrada);
app.use(manejoErrores);

module.exports = {
    app,
};
