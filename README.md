# Nick13's Garage

Plataforma e-commerce de repuestos automotrices vintage con arquitectura MVC, API RESTful segura y frontend moderno para consumo de endpoints protegidos con JWT.

## Descripcion Profesional

Nick13's Garage es una solucion fullstack orientada a portafolio tecnico que implementa buenas practicas de desarrollo backend y frontend en un escenario real de comercio electronico.
El proyecto integra autenticacion stateless con JWT, persistencia en PostgreSQL, control de acceso por rutas, validaciones robustas de entrada, subida segura de archivos y una interfaz web atractiva para gestion de usuarios, catalogo y carrito.

Esta implementacion esta pensada para demostrar capacidades de:

- diseno de API REST con codigos HTTP correctos
- seguridad aplicada sin degradar experiencia de uso
- separacion de responsabilidades con patron MVC
- integracion completa entre cliente web y servicios protegidos

## Caracteristicas Clave

- Registro y login de usuarios con password hasheada (bcrypt)
- Emision y verificacion de JWT para rutas protegidas
- Catalogo de productos cargado desde PostgreSQL
- Carrito por usuario autenticado (agregar, listar y eliminar)
- Checkout del carrito con simulacion de pago por tarjeta de credito
- Upload de imagenes con validacion de tipo y extension
- Edicion y eliminacion de productos restringida a rol administrador
- Headers de seguridad con Helmet
- Compatibilidad controlada por CORS
- Frontend responsive con Bootstrap + JavaScript vanilla (Fetch API)

## Stack Tecnologico

- Frontend: HTML, CSS, Bootstrap, JavaScript
- Backend: Node.js, Express, JWT (jsonwebtoken), bcryptjs, express-fileupload, Helmet, CORS
- Base de Datos: PostgreSQL (driver pg)
- DevOps: Git y GitHub

## Credenciales y Certificaciones

- Google Cybersecurity Professional Certificate
- Finalizacion del programa Oracle Next Education (ONE) - Oracle + Alura Latam

### Insignias Oracle ONE

[![Badge Conversor](public/img/badges/Badge-Conversor.png)](public/img/badges/Badge-Conversor.png)
[![Badge Literalura](public/img/badges/Badge-Literalura.png)](public/img/badges/Badge-Literalura.png)
[![Badge Spring ForoHub](public/img/badges/Badge-Spring-ForoHub.png)](public/img/badges/Badge-Spring-ForoHub.png)
[![Insignia Proyecto Amigo Secreto](public/img/badges/Insignia%20Proyecto%20Amigo%20Secreto.png)](public/img/badges/Insignia%20Proyecto%20Amigo%20Secreto.png)

## Arquitectura

El proyecto sigue MVC con capas separadas:

- modelos: acceso a datos y consultas SQL parametrizadas
- controladores: reglas de negocio y respuestas HTTP
- rutas: definicion de endpoints por modulo
- middleware: autenticacion, validaciones y manejo de errores
- config: conexion de base de datos e inicializacion
- public: cliente web y assets estaticos

## Seguridad Implementada

- Inyeccion SQL mitigada con consultas parametrizadas
- Password protegida con hash bcrypt
- Autorizacion por Bearer Token JWT en rutas privadas
- Control de permisos por rol (admin/user)
- Validacion y sanitizacion de datos de entrada
- Restriccion de extensiones y MIME type en uploads
- Helmet con CSP y politicas de seguridad
- Manejo consistente de errores sin exponer detalles sensibles

## Credenciales de Administrador

- Username: admin
- Password: ADMIN

## Requisitos Previos

- Node.js 18+ (recomendado 20+)
- npm 9+
- PostgreSQL 13+

## Configuracion Local

1. Instalar dependencias:

```bash
npm install
```

1. Crear el archivo de entorno desde el ejemplo:

```bash
copy .env.example .env
```

1. Configurar en `.env` las variables de conexion:

- DB_HOST
- DB_PORT
- DB_USER
- DB_PASSWORD
- JWT_SECRET

1. Crear la base de datos con nombre obligatorio:

```sql
CREATE DATABASE "portafolio_mod8_DB";
```

1. Ejecutar la aplicacion:

```bash
npm run dev
```

## Variables de Entorno

| Variable | Requerida | Descripcion |
| --- | --- | --- |
| PORT | No | Puerto HTTP de la API (default: 3000) |
| DB_HOST | Si | Host de PostgreSQL |
| DB_PORT | Si | Puerto de PostgreSQL |
| DB_USER | Si | Usuario PostgreSQL |
| DB_PASSWORD | Si | Password PostgreSQL |
| JWT_SECRET | Si | Clave privada para firma de JWT |
| JWT_EXPIRES_IN | No | Tiempo de expiracion del token (default: 8h) |
| MAX_UPLOAD_MB | No | Limite de upload en MB (default: 3) |
| ADMIN_USERNAME | No | Usuario administrador semilla (default: admin) |
| ADMIN_PASSWORD | No | Password administrador semilla (default: ADMIN) |
| ADMIN_EMAIL | No | Email administrador semilla |

## Scripts Disponibles

- `npm run dev`: inicia servidor con nodemon
- `npm start`: inicia servidor con node

## API Reference

### Salud

- GET `/api/salud`

### Autenticacion

- POST `/api/auth/register`
- POST `/api/auth/login`

### Productos (protegido)

- GET `/api/products`
- POST `/api/products`
- PUT `/api/products/:productId` (solo administrador)
- DELETE `/api/products/:productId` (solo administrador)

### Carrito (protegido)

- POST `/api/cart`
- GET `/api/cart`
- DELETE `/api/cart/:productId`
- POST `/api/cart/checkout`

### Upload (protegido)

- POST `/api/upload`

## Productos Semilla

Se insertan automaticamente al iniciar la aplicacion por primera vez:

1. Carburador Zenith 32 Vintage
2. Par de Faros Sellados 7 Pulgadas
3. Kit de Bujias Cobre Clasicas

Cada producto incluye imagen en `public/img/`.

## Estructura del Proyecto

```text
.
├── generadorPswd/
│   ├── claves_supersecretas.json
│   └── generador_aleatorio_PSWD.js
├── public/
│   ├── css/
│   │   └── estilo.css
│   ├── img/
│   │   ├── bujias.png
│   │   ├── carburador.png
│   │   └── faros.png
│   ├── js/
│   │   └── cliente.js
│   └── index.html
├── src/
│   ├── config/
│   │   └── baseDatos.js
│   ├── controladores/
│   ├── middleware/
│   ├── modelos/
│   ├── rutas/
│   ├── utils/
│   │   └── jwt.js
│   ├── app.js
│   └── server.js
├── uploads/
├── .env.example
├── instrucciones.md
└── package.json
```

## Validacion Funcional

Aplicacion validada con pruebas funcionales completas sobre:

- autenticacion
- autorizacion
- productos
- carrito
- upload
- carga de UI y recursos estaticos

Resultado de validacion: flujo operativo completo y estable.
