const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const nombreBaseDatos = 'portafolio_mod8_DB';

const variablesConexionRequeridas = ['DB_USER', 'DB_PASSWORD', 'DB_HOST', 'DB_PORT'];

for (const nombreVariable of variablesConexionRequeridas) {
    if (!process.env[nombreVariable]) {
        throw new Error(`Falta la variable de entorno requerida: ${nombreVariable}`);
    }
}

const puertoBaseDatos = Number(process.env.DB_PORT);

if (!Number.isInteger(puertoBaseDatos) || puertoBaseDatos <= 0) {
    throw new Error('DB_PORT debe ser un numero entero positivo.');
}

const configuracionPool = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: puertoBaseDatos,
    database: nombreBaseDatos,
};

const pool = new Pool(configuracionPool);

const passwordAdminPorDefecto = String.fromCodePoint(65, 68, 77, 73, 78);

const credencialesAdministrador = {
    username: process.env.ADMIN_USERNAME || 'admin',
    email: process.env.ADMIN_EMAIL || 'admin@nick13garage.local',
    password: process.env.ADMIN_PASSWORD || passwordAdminPorDefecto,
};

const productosSemilla = [
    {
        nombre: 'Carburador Zenith 32 Vintage',
        descripcion: 'Carburador restaurado para motores clasicos de 4 cilindros.',
        precio: 289990,
        imageUrl: '/img/carburador.png',
    },
    {
        nombre: 'Par de Faros Sellados 7 Pulgadas',
        descripcion: 'Juego de faros redondos estilo retro para conversion clasica.',
        precio: 149990,
        imageUrl: '/img/faros.png',
    },
    {
        nombre: 'Kit de Bujias Cobre Clasicas',
        descripcion: 'Set de 4 bujias de cobre para encendido estable en vehiculos vintage.',
        precio: 45990,
        imageUrl: '/img/bujias.png',
    },
];

async function consulta(texto, parametros = []) {
    return pool.query(texto, parametros);
}

async function crearTablas() {
    await consulta(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
            role VARCHAR(20) NOT NULL DEFAULT 'user',
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

    await consulta(`
        ALTER TABLE users
        ADD COLUMN IF NOT EXISTS role VARCHAR(20) NOT NULL DEFAULT 'user';
    `);

    await consulta(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name VARCHAR(120) UNIQUE NOT NULL,
      description TEXT NOT NULL,
      price NUMERIC(12, 2) NOT NULL CHECK (price > 0),
      image_url TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

    await consulta(`
    CREATE TABLE IF NOT EXISTS cart_items (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      quantity INTEGER NOT NULL CHECK (quantity > 0),
      created_at TIMESTAMP NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
      UNIQUE (user_id, product_id)
    );
  `);

    await consulta('CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);');
    await consulta('CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);');
}

async function sembrarAdministrador() {
    const passwordHash = await bcrypt.hash(credencialesAdministrador.password, 10);

    const existente = await consulta(
        'SELECT id FROM users WHERE username = $1 OR email = $2 LIMIT 1;',
        [credencialesAdministrador.username, credencialesAdministrador.email]
    );

    if (existente.rows[0]) {
        await consulta(
            `
          UPDATE users
          SET username = $1,
              email = $2,
              password_hash = $3,
              role = 'admin'
          WHERE id = $4;
          `,
            [
                credencialesAdministrador.username,
                credencialesAdministrador.email,
                passwordHash,
                existente.rows[0].id,
            ]
        );

        return;
    }

    await consulta(
        `
      INSERT INTO users (username, email, password_hash, role)
      VALUES ($1, $2, $3, 'admin')
      `,
        [credencialesAdministrador.username, credencialesAdministrador.email, passwordHash]
    );
}

async function sembrarProductos() {
    for (const producto of productosSemilla) {
        await consulta(
            `
      INSERT INTO products (name, description, price, image_url)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (name)
      DO UPDATE
      SET description = EXCLUDED.description,
          price = EXCLUDED.price,
          image_url = EXCLUDED.image_url;
      `,
            [producto.nombre, producto.descripcion, producto.precio, producto.imageUrl]
        );
    }
}

async function inicializarBaseDatos() {
    await crearTablas();
    await sembrarAdministrador();
    await sembrarProductos();
}

module.exports = {
    pool,
    consulta,
    inicializarBaseDatos,
};
