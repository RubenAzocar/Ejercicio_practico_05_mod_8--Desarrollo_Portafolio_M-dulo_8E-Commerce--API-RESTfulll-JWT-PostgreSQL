const { consulta } = require('../config/baseDatos');

async function agregarOActualizarCarrito(userId, productId, quantity) {
    await consulta(
        `
    INSERT INTO cart_items (user_id, product_id, quantity)
    VALUES ($1, $2, $3)
    ON CONFLICT (user_id, product_id)
    DO UPDATE
      SET quantity = cart_items.quantity + EXCLUDED.quantity,
          updated_at = NOW();
    `,
        [userId, productId, quantity]
    );
}

async function obtenerCarrito(userId) {
    const resultado = await consulta(
        `
    SELECT
      ci.product_id,
      ci.quantity,
      p.name,
      p.description,
      p.price,
      p.image_url,
      (ci.quantity * p.price) AS subtotal
    FROM cart_items ci
    INNER JOIN products p ON p.id = ci.product_id
    WHERE ci.user_id = $1
    ORDER BY ci.id ASC;
    `,
        [userId]
    );

    return resultado.rows;
}

async function eliminarProductoDelCarrito(userId, productId) {
    const resultado = await consulta(
        'DELETE FROM cart_items WHERE user_id = $1 AND product_id = $2;',
        [userId, productId]
    );

    return resultado.rowCount;
}

async function vaciarCarrito(userId) {
    const resultado = await consulta('DELETE FROM cart_items WHERE user_id = $1;', [userId]);
    return resultado.rowCount;
}

module.exports = {
    agregarOActualizarCarrito,
    obtenerCarrito,
    eliminarProductoDelCarrito,
    vaciarCarrito,
};
