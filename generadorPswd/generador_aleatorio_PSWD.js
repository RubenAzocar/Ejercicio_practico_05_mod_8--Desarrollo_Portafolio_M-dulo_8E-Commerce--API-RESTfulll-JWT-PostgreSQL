const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const rutaSalida = path.join(__dirname, 'claves_supersecretas.json');
const alfabetoMayusculas = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const alfabetoMinusculas = 'abcdefghijklmnopqrstuvwxyz';
const numeros = '0123456789';
const simbolos = '!@#$%^&*()-_=+[]{};:,.?';
const todosLosCaracteres = alfabetoMayusculas + alfabetoMinusculas + numeros + simbolos;

function obtenerArgumento(nombre, valorPorDefecto) {
    const prefijo = `--${nombre}=`;
    const argumento = process.argv.find((valor) => valor.startsWith(prefijo));

    if (!argumento) {
        return valorPorDefecto;
    }

    return argumento.slice(prefijo.length);
}

function generarCaracter(coleccion) {
    const indice = crypto.randomInt(0, coleccion.length);
    return coleccion[indice];
}

function mezclarCadena(texto) {
    const arreglo = [...texto];

    for (let indice = arreglo.length - 1; indice > 0; indice -= 1) {
        const indiceAleatorio = crypto.randomInt(0, indice + 1);
        [arreglo[indice], arreglo[indiceAleatorio]] = [arreglo[indiceAleatorio], arreglo[indice]];
    }

    return arreglo.join('');
}

function generarClaveSupersecreta(longitud) {
    if (!Number.isInteger(longitud) || longitud < 12) {
        throw new Error('La longitud debe ser un entero mayor o igual a 12.');
    }

    const baseObligatoria = [
        generarCaracter(alfabetoMayusculas),
        generarCaracter(alfabetoMinusculas),
        generarCaracter(numeros),
        generarCaracter(simbolos),
    ];

    let clave = baseObligatoria.join('');

    for (let indice = clave.length; indice < longitud; indice += 1) {
        clave += generarCaracter(todosLosCaracteres);
    }

    return mezclarCadena(clave);
}

function leerHistorial() {
    if (!fs.existsSync(rutaSalida)) {
        return [];
    }

    const contenido = fs.readFileSync(rutaSalida, 'utf8').trim();
    if (!contenido) {
        return [];
    }

    const datos = JSON.parse(contenido);
    return Array.isArray(datos) ? datos : [];
}

function guardarHistorial(historial) {
    fs.writeFileSync(rutaSalida, JSON.stringify(historial, null, 2), 'utf8');
}

function crearEntradas(cantidad, longitud) {
    const entradas = [];

    for (let indice = 0; indice < cantidad; indice += 1) {
        entradas.push({
            id: crypto.randomUUID(),
            fecha_iso: new Date().toISOString(),
            longitud,
            clave: generarClaveSupersecreta(longitud),
        });
    }

    return entradas;
}

function main() {
    const longitud = Number.parseInt(obtenerArgumento('longitud', '48'), 10);
    const cantidad = Number.parseInt(obtenerArgumento('cantidad', '1'), 10);

    if (!Number.isInteger(cantidad) || cantidad <= 0 || cantidad > 100) {
        throw new Error('La cantidad debe ser un entero entre 1 y 100.');
    }

    const historial = leerHistorial();
    const nuevasEntradas = crearEntradas(cantidad, longitud);
    const historialActualizado = historial.concat(nuevasEntradas);

    guardarHistorial(historialActualizado);

    console.log(`Se generaron ${cantidad} clave(s) y se guardaron en ${rutaSalida}.`);
}

try {
    main();
} catch (error) {
    console.error('No fue posible generar las claves:', error.message);
    process.exit(1);
}
