const { consulta } = require('../config/baseDatos');

async function listarProductos() {
    const resultado = await consulta(
        'SELECT id, name, description, price, image_url FROM products ORDER BY id ASC;'
    );

    return resultado.rows;
}

async function obtenerProductoPorId(productId) {
    const resultado = await consulta(
        'SELECT id, name, description, price, image_url FROM products WHERE id = $1 LIMIT 1;',
        [productId]
    );

    return resultado.rows[0] || null;
}

async function crearProducto({ name, description, price, imageUrl }) {
    const resultado = await consulta(
        `
      INSERT INTO products (name, description, price, image_url)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, description, price, image_url;
      `,
        [name, description, price, imageUrl]
    );

    return resultado.rows[0];
}

async function actualizarProducto(productId, { name, description, price, imageUrl }) {
    const resultado = await consulta(
        `
      UPDATE products
      SET name = $2,
          description = $3,
          price = $4,
          image_url = $5
      WHERE id = $1
      RETURNING id, name, description, price, image_url;
      `,
        [productId, name, description, price, imageUrl]
    );

    return resultado.rows[0] || null;
}

async function eliminarProducto(productId) {
    const resultado = await consulta('DELETE FROM products WHERE id = $1;', [productId]);
    return resultado.rowCount;
}

module.exports = {
    listarProductos,
    obtenerProductoPorId,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
};
