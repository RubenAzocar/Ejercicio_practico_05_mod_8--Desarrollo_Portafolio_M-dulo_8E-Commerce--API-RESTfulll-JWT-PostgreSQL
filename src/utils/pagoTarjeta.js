const crypto = require('node:crypto');

const TARJETA_RECHAZADA_SIMULADA = '4000000000000002';

function normalizarNumeroTarjeta(numeroTarjeta) {
    return String(numeroTarjeta || '').replaceAll(/\D+/g, '');
}

function validarLuhn(numeroTarjeta) {
    let suma = 0;
    let duplicar = false;

    for (let indice = numeroTarjeta.length - 1; indice >= 0; indice -= 1) {
        let digito = Number(numeroTarjeta[indice]);

        if (duplicar) {
            digito *= 2;
            if (digito > 9) {
                digito -= 9;
            }
        }

        suma += digito;
        duplicar = !duplicar;
    }

    return suma % 10 === 0;
}

function detectarMarca(numeroTarjeta) {
    if (/^4\d{12}(\d{3})?(\d{3})?$/.test(numeroTarjeta)) {
        return 'VISA';
    }

    if (/^5[1-5]\d{14}$/.test(numeroTarjeta) || /^2[2-7]\d{14}$/.test(numeroTarjeta)) {
        return 'MASTERCARD';
    }

    if (/^3[47]\d{13}$/.test(numeroTarjeta)) {
        return 'AMEX';
    }

    return 'OTRA';
}

function simularPagoTarjeta({ cardNumber, cardHolder, expiryMonth, expiryYear, amount }) {
    const numeroNormalizado = normalizarNumeroTarjeta(cardNumber);
    const monto = Number(amount);

    if (!Number.isFinite(monto) || monto <= 0) {
        return {
            aprobado: false,
            codigo: 'MONTO_INVALIDO',
            mensaje: 'El monto del pago no es valido para la simulacion.',
        };
    }

    if (!/^\d{13,19}$/.test(numeroNormalizado)) {
        return {
            aprobado: false,
            codigo: 'TARJETA_INVALIDA',
            mensaje: 'El numero de tarjeta no es valido para la simulacion.',
        };
    }

    if (!validarLuhn(numeroNormalizado)) {
        return {
            aprobado: false,
            codigo: 'TARJETA_INVALIDA',
            mensaje: 'La tarjeta no supera validacion Luhn en la simulacion.',
        };
    }

    if (numeroNormalizado === TARJETA_RECHAZADA_SIMULADA) {
        return {
            aprobado: false,
            codigo: 'PAGO_RECHAZADO',
            mensaje: 'Pago rechazado por el emisor (simulacion).',
        };
    }

    const ultimos4 = numeroNormalizado.slice(-4);
    const transaccionId = `SIM-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
    const codigoAutorizacion = String(crypto.randomInt(100000, 999999));

    return {
        aprobado: true,
        codigo: 'PAGO_APROBADO',
        mensaje: 'Pago aprobado en simulacion.',
        transaccionId,
        codigoAutorizacion,
        marca: detectarMarca(numeroNormalizado),
        ultimos4,
        titular: cardHolder,
        monto: Number(monto.toFixed(2)),
        expiracion: `${String(expiryMonth).padStart(2, '0')}/${String(expiryYear).slice(-2)}`,
    };
}

module.exports = {
    simularPagoTarjeta,
};
