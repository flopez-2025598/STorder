# STorder

STorder es una aplicación web para administrar usuarios, categorías, productos, inventario y pedidos

## Tecnologías y organización

El backend utiliza **Node.js, Express y TypeScript**. Los datos se guardan en **PostgreSQL** y el frontend está hecho con **Angular**. Uso **pnpm** para instalar las dependencias y ejecutar las aplicaciones.

```text
STorder/
├── auth-service/      # Usuarios, inicio de sesión y permisos
├── catalog-service/   # Categorías, productos, inventario y pedidos
├── frontend-client/   # Aplicación Angular
└── database/          # Scripts de PostgreSQL
```

Cada servicio del backend usa su propia base de datos. `auth-service` trabaja con `storder_auth`, que contiene las tablas `users` y `roles`. `catalog-service` utiliza `storder_catalog`, que contiene `categories`, `products`, `orders` y `order_items`.

Separé las bases de datos para que cada servicio sea responsable de su información. El catálogo comprueba la identidad y los permisos consultando `GET /api/auth/me` en el servicio de autenticación, sin acceder directamente a su base de datos.

## Funciones disponibles

**Fase 1 — Estructura inicial.** Preparé los servicios, las conexiones a PostgreSQL y una pantalla inicial en Angular. Comprobé que los dos servicios respondieran en sus rutas de estado.

**Fase 2 — Autenticación.** Implementé el registro de usuarios, el inicio de sesión con JWT y dos roles: `admin` y `operator`. Las contraseñas se almacenan usando bcrypt y se validan los datos recibidos con Zod.

**Fase 3 — Catálogo y pedidos.** Agregué las categorías y las operaciones para crear, consultar, buscar, editar y eliminar productos. También se pueden consultar y actualizar las existencias. Al crear un pedido, el backend calcula el total con los precios guardados en PostgreSQL y descuenta las unidades compradas. Si no hay existencias suficientes, rechaza el pedido sin guardar cambios parciales.

Las modificaciones de categorías, productos e inventario requieren permisos de administrador. Los usuarios autenticados pueden crear pedidos y consultar los que les corresponden; los administradores pueden consultar todos.

**Estado actual:** los servicios de backend funcionan y han sido probados mediante peticiones HTTP. Falta conectar estas funciones con las pantallas de Angular.

## Preparación y ejecución

Necesito tener instalados Node.js, pnpm y PostgreSQL. Las dos bases de datos se crean con los scripts iniciales de `database/`. Después configuro `auth-service/.env` y `catalog-service/.env` usando como guía sus archivos `.env.example`.

`auth-service/.env` necesita un `JWT_SECRET`. Puedo generar uno con `openssl rand -hex 32`. `catalog-service` usa `AUTH_SERVICE_URL` para comunicarse con autenticación; por defecto apunta a `http://127.0.0.1:3001`. **Los archivos `.env` reales no se suben a GitHub.**

Si ya existen las bases de datos de la primera fase, ejecuto las migraciones correspondientes desde la raíz del repositorio:

```bash
psql -X -U postgres -d storder_auth -v ON_ERROR_STOP=1 -f database/auth-phase-2.sql
psql -X -U postgres -d storder_catalog -v ON_ERROR_STOP=1 -f database/catalog-phase-3.sql
```

Instalo las dependencias y compruebo que los servicios compilen:

```bash
pnpm --dir auth-service install --frozen-lockfile
pnpm --dir catalog-service install --frozen-lockfile
pnpm --dir frontend-client install --frozen-lockfile
pnpm --dir auth-service run build
pnpm --dir catalog-service run build
```

Inicio cada aplicación en una terminal diferente:

```bash
pnpm --dir auth-service run dev
```

```bash
pnpm --dir catalog-service run dev
```

```bash
pnpm --dir frontend-client run start
```

Los puertos de desarrollo son `3001` para autenticación, `3002` para catálogo y `4200` para Angular.

## Rutas principales

En **autenticación** (`http://127.0.0.1:3001`):

- `POST /api/auth/register`: registra un usuario nuevo con rol `operator`.
- `POST /api/auth/login`: comprueba las credenciales y devuelve un JWT.
- `GET /api/auth/me`: consulta el usuario autenticado.
- `GET /api/auth/admin/check`: comprueba el acceso de un administrador.

En **catálogo** (`http://127.0.0.1:3002`):

- `GET /api/categories` y `POST /api/categories`: consultar y crear categorías.
- `GET /api/products`: consultar productos; admite los filtros `name` y `categoryId`.
- `POST /api/products`: crear un producto.
- `GET /api/products/:id`: consultar un producto.
- `PATCH /api/products/:id` y `DELETE /api/products/:id`: modificar o eliminar un producto.
- `GET /api/products/:id/stock` y `PATCH /api/products/:id/stock`: consultar o cambiar existencias.
- `POST /api/orders`: crear un pedido.
- `GET /api/orders` y `GET /api/orders/:id`: consultar pedidos según los permisos.

Las rutas protegidas reciben el encabezado `Authorization: Bearer TOKEN`. Las peticiones que envían datos JSON necesitan `Content-Type: application/json`.

## Ejemplos de pruebas

Consultar los productos cuyo nombre contiene «Mouse»:

```bash
curl -i 'http://127.0.0.1:3002/api/products?name=Mouse'
```

Crear un producto como administrador (sustituir los identificadores y el token):

```bash
curl -i -X POST http://127.0.0.1:3002/api/products \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer TU_TOKEN' \
  -d '{"name":"Mouse de prueba","description":"Mouse para computadora","price":125,"stock":15,"categoryId":"UUID_DE_CATEGORIA"}'
```

Crear un pedido con dos unidades:

```bash
curl -i -X POST http://127.0.0.1:3002/api/orders \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer TU_TOKEN' \
  -d '{"items":[{"productId":"UUID_DEL_PRODUCTO","quantity":2}]}'
```

Durante las pruebas locales creé un mouse con 15 unidades y registré un pedido de dos; el inventario quedó en 13. Al solicitar 20 unidades, el servicio respondió `409` y no creó otro pedido. También comprobé la modificación de existencias y la eliminación de un producto de prueba. Un usuario `operator` recibió `403` al intentar crear un producto.

Los errores principales son `400` para datos inválidos, `401` cuando falta una autenticación válida, `403` para permisos insuficientes, `404` cuando no existe el recurso y `409` para conflictos como existencias insuficientes.

## Cómo está organizado el código

En el backend separé las rutas, los controladores, los servicios, los repositorios y los esquemas de validación. Las rutas definen las direcciones HTTP; los controladores reciben las peticiones; los servicios aplican las reglas del sistema; los repositorios consultan PostgreSQL y Zod valida los datos de entrada.

Al crear un pedido, se utiliza una transacción de PostgreSQL y se bloquean los productos involucrados mientras se comprueba y descuenta el inventario. Así se evita guardar pedidos a medias o que dos compras simultáneas descuenten las mismas unidades.

## Registro de instrucciones de desarrollo

Se conservan a continuación las indicaciones técnicas usadas en las Fases 2 y 3. La Fase 1 todavía no tiene agregado su mensaje original. Estas versiones están editadas y no sustituyen el historial literal de las conversaciones.

### Fase 2: autenticación

<details>
<summary>Ver indicaciones de la Fase 2</summary>

```text
Estoy desarrollando STorder, un sistema distribuido de gestión de pedidos e inventario 
Ya terminé la Fase 1. Tengo dos microservicios con Node.js, Express y TypeScript, dos bases PostgreSQL independientes y un frontend Angular standalone.
Quiero que implementes la **Fase 2: autenticación con JWT**, trabajando únicamente sobre la estructura que ya existe.
## 1. Antes de modificar el código
\- Revisa primero los archivos existentes de `auth-service`, los scripts de `database/`.
\- Respeta la arquitectura y las convenciones que ya tiene el proyecto.
\- No vuelvas a crear el proyecto desde cero.
\- No cambies las configuraciones de `catalog-service` ni de `frontend-client` salvo que sea estrictamente necesario. Esta fase corresponde al backend de autenticación.
\- Utiliza **pnpm**, no npm.
\- No modifiques ramas de Git, no hagas commits, no hagas push y no crees Pull Requests. Yo me encargaré de eso.
\- No borres ni reemplaces las bases de datos existentes.
## 2. Registro de usuarios
Implementa el endpoint:
`POST /api/auth/register`
Debe permitir registrar un usuario con los siguientes datos:
\- Nombre
\- Correo electrónico
\- Contraseña
Requisitos:
\- Validar los datos usando Zod.
\- Verificar que el correo no esté registrado.
\- Guardar la contraseña utilizando bcrypt.
\- Al registrar un usuario, asignarle el rol `operator` por defecto.
\- No permitir que un usuario elija el rol `admin` desde el registro público.
\- No devolver contraseñas ni hashes en las respuestas.
\- Utilizar consultas parametrizadas de PostgreSQL.
\- Responder con HTTP 201 cuando el registro sea exitoso.
## 3. Inicio de sesión
Implementa el endpoint:
`POST /api/auth/login`
Debe:
\- Recibir correo electrónico y contraseña.
\- Verificar que el usuario exista.
\- Comprobar la contraseña usando bcrypt.
\- Generar un JWT firmado con una clave almacenada en variables de entorno.
\- Incluir en el token únicamente los datos necesarios para identificar al usuario y su rol.
\- Devolver el token y los datos públicos del usuario.
\- Devolver HTTP 401 cuando las credenciales sean incorrectas.
## 4. Middleware JWT
Crea un middleware encargado de:
\- Leer el encabezado `Authorization: Bearer TOKEN`.
\- Comprobar la firma y vencimiento del JWT.
\- Rechazar tokens inválidos o vencidos con HTTP 401.
\- Agregar los datos autenticados del usuario a la petición mediante una extensión tipada de Express.
\- Permitir proteger rutas sin repetir la validación en cada controlador.
Implementa también una función o middleware para verificar roles.
## 5. Endpoint protegido
Implementa:
`GET /api/auth/me`
Debe:
\- Requerir un JWT válido.
\- Consultar los datos actuales del usuario en PostgreSQL.
\- Devolver su información pública, incluyendo el rol.
\- No exponer información sensible.
Agrega una ruta administrativa sencilla y justificada para comprobar el middleware de autorización por roles. Debe permitir acceso únicamente a `admin` y responder con HTTP 403 cuando el usuario autenticado no tenga permisos.
## 6. Organización del código
Mantén las responsabilidades separadas:
\- Routes: definir las rutas HTTP.
\- Controllers: recibir las peticiones y responder.
\- Services: manejar la lógica de negocio.
\- Repositories: realizar las consultas a PostgreSQL.
\- Middlewares: validar tokens, roles y errores.
\- DTOs, interfaces y tipos: definir los datos de entrada, salida y los objetos usados internamente.
\- Schemas: validar los datos recibidos mediante Zod.
Adapta esta organización a las carpetas existentes. No crees capas innecesarias.
Utiliza TypeScript estricto, evitando `any`.
## 7. PostgreSQL
Trabaja con la base existente `storder_auth` y revisa las tablas `users` y `roles` antes de implementar las consultas.
\- Reutiliza las tablas y columnas existentes.
\- Si necesitas modificar la estructura, crea un script SQL incremental y explica el motivo.
\- No elimines datos ni recrees las tablas innecesariamente.
\- Mantén la base de datos de autenticación independiente de la base de catálogo.
\- No utilices contraseñas de base de datos directamente en el código.
## 8. Manejo de errores
Implementa respuestas JSON consistentes para los errores principales:
\- 400: datos inválidos.
\- 401: credenciales incorrectas o token inválido.
\- 403: permisos insuficientes.
\- 404: recurso inexistente.
\- 409: correo electrónico duplicado.
\- 500: error interno del servidor.
No expongas trazas internas ni información sensible al cliente.
## 9. Pruebas
Verifica los siguientes escenarios:
1. Registro correcto de usuario.
2. Registro con correo duplicado.
3. Registro con datos inválidos.
4. Login correcto.
5. Login con contraseña incorrecta.
6. Solicitud a `/api/auth/me` sin token.
7. Solicitud con JWT inválido.
8. Solicitud con JWT válido.
9. Acceso de `operator` a una ruta exclusiva de `admin`.
10. Acceso autorizado de `admin`, usando un usuario administrativo creado de forma segura.
Comprueba la compilación TypeScript y ejecuta las pruebas que permita el entorno. No afirmes que algo funciona si no pudiste comprobarlo.
## 10. Al finalizar
Muéstrame:
\- Todos los archivos creados y modificados.
\- Los endpoints implementados.
\- Los comandos pnpm necesarios para ejecutar el servicio.
\- Ejemplos de peticiones para probar los endpoints con curl o Postman.
\- Las decisiones importantes de arquitectura y seguridad.
\- Los errores detectados y cómo los solucionaste.
No continúes con la Fase 3.
**Objetivo:** dejar completamente funcional el sistema de autenticación JWT de STorder sin afectar el catálogo ni el frontend existentes.
```

</details>

### Fase 3: catálogo y pedidos

<details>
<summary>Ver indicaciones de la Fase 3</summary>

```text
Ya tengo terminadas la Fase 1, que incluye la estructura del proyecto, las conexiones a PostgreSQL y Angular inicial, y la Fase 2, que incluye registro de usuarios, inicio de sesión, JWT y permisos.
Ahora quiero implementar la Fase 3: catálogo, productos, inventario y pedidos.
Antes de empezar, revisa el código que ya existe en catalog-service, la base de datos y los scripts de la carpeta database. No vuelvas a crear el proyecto desde cero ni elimines datos existentes.
1. Catálogo y categorías
Quiero poder consultar las categorías disponibles y crear nuevas categorías desde el backend.
Reutiliza la tabla categories que ya tengo en PostgreSQL. Evita categorías repetidas y valida que el nombre no esté vacío.
2. Productos
Implementa los endpoints necesarios para consultar, agregar, editar y eliminar productos.
Cada producto debe tener nombre, descripción, precio, cantidad disponible y categoría.
Quiero poder buscar productos por nombre y consultar los productos de una categoría.
Valida que los precios no sean negativos, que la cantidad disponible no sea negativa y que la categoría exista.
Si un producto no existe, devuelve un error adecuado.
3. Inventario
Cuando se agregue un producto debe quedar guardada su cantidad disponible.
Quiero poder actualizar esa cantidad y consultar cuántas unidades quedan.
No permitas cantidades negativas.
4. Pedidos
Utiliza las tablas orders y order_items que ya existen.
Implementa la creación y consulta de pedidos, permitiendo incluir varios productos y sus cantidades.
Al crear un pedido, el sistema debe comprobar que haya suficientes unidades disponibles.
Si hay existencias, debe guardar el pedido y descontar las cantidades correspondientes.
Si alguno de los productos no tiene suficientes unidades, no debe guardar el pedido ni descontar parcialmente el inventario.
Utiliza transacciones de PostgreSQL para mantener los datos correctos.
Calcula el total del pedido en el backend utilizando los precios guardados en la base de datos, sin confiar en un total enviado desde el frontend.
5. Seguridad
Revisa cómo funciona la autenticación de auth-service.
Las operaciones que modifiquen el catálogo o inventario deben estar protegidas. No permitas crear, modificar o eliminar productos sin autorización.
Mantén las bases de datos independientes. No consultes directamente las tablas de storder_auth desde catalog-service.
Si necesitas comprobar tokens o permisos, implementa una solución compatible con la autenticación existente y explica cómo funciona, sin copiar información sensible ni romper la independencia de los servicios.
6. Organización
Mantén una estructura sencilla y ordenada con rutas, controladores, servicios, repositorios y validaciones, siguiendo el estilo de la Fase 2.
Utiliza Node.js, Express, TypeScript estricto, PostgreSQL y Zod.
No utilices any innecesariamente.
Usa pnpm para las dependencias y comandos.
7. Base de datos
Trabaja con storder_catalog.
Revisa las tablas y columnas actuales antes de escribir consultas.
Si necesitas modificar alguna tabla, crea un script SQL nuevo que pueda aplicarse sin borrar los datos anteriores.
No recrees las bases de datos ni elimines información existente.
8. Pruebas
Comprueba que funcionen el registro y la consulta de categorías, la creación y modificación de productos, la búsqueda, la actualización del inventario y la creación de pedidos.
También quiero pruebas donde los datos sean incorrectos, los productos no existan o no haya suficientes unidades.
Verifica que las transacciones eviten descuentos parciales y problemas cuando se hagan pedidos simultáneamente.
Ejecuta la compilación TypeScript y las pruebas que permita el entorno. Si algo no se pudo probar, indícalo claramente.
9. Al terminar
Explícame qué archivos creaste o modificaste, qué endpoints agregaste, qué cambios hiciste en PostgreSQL y cómo puedo probar cada función.
No hagas commits, push, merges ni Pull Requests.
No modifiques innecesariamente auth-service o frontend-client.
No avances a la Fase 4.
Quiero terminar esta fase con el catálogo, inventario y pedidos funcionando correctamente desde el backend.
```

</details>
