STorder
STorder aplicación web donde se puedan manejar usuarios, productos y pedidos.
Cómo está organizado
El proyecto tiene dos servicios de backend y una aplicación en Angular. Lo separé así para que cada parte tenga su trabajo y no dependa directamente de las tablas de la otra.

auth-service se encarga de los usuarios, el inicio de sesión y los permisos. catalog-service es donde voy a manejar los productos, categorías y pedidos. frontend-client es la parte visual que se conecta con los servicios usando HTTP. En la carpeta database guardo los scripts SQL.

Estoy usando Node.js, Express y TypeScript en el backend, PostgreSQL para las bases de datos y Angular para el frontend. Para instalar las dependencias y ejecutar los proyectos uso pnpm.
Bases de datos
Tengo dos bases de datos en PostgreSQL. storder_auth es para el servicio de autenticación y tiene las tablas users y roles. storder_catalog es para el catálogo y tiene las tablas categories, products, orders y order_items.

Preferí usar bases separadas porque no quiero que el servicio de usuarios dependa de la base de productos. Por ejemplo, si el catálogo deja de funcionar, el login debería seguir funcionando mientras auth-service y su base de datos estén disponibles.
Lo que llevo hecho
En la primera fase preparé las carpetas, los servicios con TypeScript, la conexión a cada base de datos y una pantalla inicial en Angular. Probé los endpoints de estado y ambos servicios respondieron correctamente.

En la segunda fase trabajé la autenticación. Ya puedo registrar usuarios con el rol operator, iniciar sesión y recibir un token JWT. Las contraseñas no se guardan como texto normal, sino como un hash con bcrypt. También agregué validaciones con Zod y rutas que necesitan un token para funcionar.

Probé el registro y recibí 201, el login respondió 200, la consulta de mi usuario respondió 200 con un token válido y la ruta de administrador respondió 403 cuando entré con un usuario operator. Ese último resultado es correcto porque el usuario no tiene permisos de administrador.

Todavía falta terminar las operaciones del catálogo y los pedidos, además de conectar esas funciones con las pantallas de Angular.
Cómo ejecutar el proyecto
Necesito tener instalados Node.js, pnpm y PostgreSQL. Primero creo las bases de datos con los scripts de la carpeta database y preparo los archivos .env de cada servicio tomando como ejemplo sus .env.example.

Para la autenticación de la segunda fase aplico esta migración en mi base local:
psql -X -U postgres -d storder_auth -f database/auth-phase-2.sql
También necesito configurar JWT_SECRET en auth-service/.env. Puedo generar un valor con openssl rand -hex 32. No subo mis archivos .env a GitHub porque contienen contraseñas y datos privados.

Después, desde la carpeta principal del proyecto, ejecuto cada aplicación en una terminal diferente:
pnpm --dir auth-service run dev
pnpm --dir catalog-service run dev
pnpm --dir frontend-client run start
El servicio de autenticación usa el puerto 3001, el catálogo el 3002 y Angular el 4200.
Rutas de autenticación
POST /api/auth/register sirve para registrar un usuario. Revisa los datos y evita registrar un correo repetido.

POST /api/auth/login comprueba el correo y la contraseña y devuelve el token JWT.

GET /api/auth/me devuelve los datos del usuario que inició sesión, siempre que mande un token válido.

GET /api/auth/admin/check sirve para comprobar los permisos. Si el usuario no es administrador, devuelve 403.

Para probar el registro y el login utilicé estos comandos:
curl -i http://127.0.0.1:3001/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Ana Pérez","email":"ana@example.test","password":"Ejemplo-local-2026"}'

curl -i http://127.0.0.1:3001/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"ana@example.test","password":"Ejemplo-local-2026"}'
Por qué lo organicé así
Separé las rutas, los controladores, los servicios y las consultas a PostgreSQL para no tener todo en un solo archivo. Las rutas indican qué endpoint se usa, los controladores reciben las peticiones, los servicios manejan la lógica y los repositorios hacen las consultas a la base de datos. Así me resulta más fácil encontrar dónde cambiar una función o corregir un error.

También uso TypeScript estricto para detectar problemas con los tipos de datos. Las contraseñas y otras configuraciones van en variables de entorno para no dejarlas escritas en el código.
Uso de IA
Usé Claude como apoyo para desarrollar y revisar algunas partes del proyecto. Fui probando los servicios en mi computadora y revisando los cambios para entender cómo funcionan. Aquí dejo registro de los prompts que utilicé, como pide la actividad.
Prompt de la Fase 1
Tengo pendiente copiar el mensaje original de esta fase desde la conversación donde lo utilicé.
Prompt de la Fase 2
<details>
<summary>Ver el prompt de autenticación</summary>Estoy desarrollando STorder, un sistema distribuido de gestión de pedidos e inventario para mi proyecto de nivelación de informática.

Ya terminé la Fase 1. Tengo dos microservicios con Node.js, Express y TypeScript, dos bases PostgreSQL independientes y un frontend Angular standalone.

Quiero que implementes la **Fase 2: autenticación con JWT**, trabajando únicamente sobre la estructura que ya existe.

## 1. Antes de modificar el código

- Revisa primero los archivos existentes de `auth-service`, los scripts de `database/` y el `README.md`.
- Respeta la arquitectura y las convenciones que ya tiene el proyecto.
- No vuelvas a crear el proyecto desde cero.
- No cambies las configuraciones de `catalog-service` ni de `frontend-client` salvo que sea estrictamente necesario. Esta fase corresponde al backend de autenticación.
- Utiliza **pnpm**, no npm.
- No modifiques ramas de Git, no hagas commits, no hagas push y no crees Pull Requests. Yo me encargaré de eso.
- No borres ni reemplaces las bases de datos existentes.

## 2. Registro de usuarios

Implementa el endpoint:

`POST /api/auth/register`

Debe permitir registrar un usuario con los siguientes datos:

- Nombre
- Correo electrónico
- Contraseña

Requisitos:

- Validar los datos usando Zod.
- Verificar que el correo no esté registrado.
- Guardar la contraseña utilizando bcrypt.
- Al registrar un usuario, asignarle el rol `operator` por defecto.
- No permitir que un usuario elija el rol `admin` desde el registro público.
- No devolver contraseñas ni hashes en las respuestas.
- Utilizar consultas parametrizadas de PostgreSQL.
- Responder con HTTP 201 cuando el registro sea exitoso.

## 3. Inicio de sesión

Implementa el endpoint:

`POST /api/auth/login`

Debe:

- Recibir correo electrónico y contraseña.
- Verificar que el usuario exista.
- Comprobar la contraseña usando bcrypt.
- Generar un JWT firmado con una clave almacenada en variables de entorno.
- Incluir en el token únicamente los datos necesarios para identificar al usuario y su rol.
- Devolver el token y los datos públicos del usuario.
- Devolver HTTP 401 cuando las credenciales sean incorrectas.

## 4. Middleware JWT

Crea un middleware encargado de:

- Leer el encabezado `Authorization: Bearer TOKEN`.
- Comprobar la firma y vencimiento del JWT.
- Rechazar tokens inválidos o vencidos con HTTP 401.
- Agregar los datos autenticados del usuario a la petición mediante una extensión tipada de Express.
- Permitir proteger rutas sin repetir la validación en cada controlador.

Implementa también una función o middleware para verificar roles.

## 5. Endpoint protegido

Implementa:

`GET /api/auth/me`

Debe:

- Requerir un JWT válido.
- Consultar los datos actuales del usuario en PostgreSQL.
- Devolver su información pública, incluyendo el rol.
- No exponer información sensible.

Agrega una ruta administrativa sencilla y justificada para comprobar el middleware de autorización por roles. Debe permitir acceso únicamente a `admin` y responder con HTTP 403 cuando el usuario autenticado no tenga permisos.

## 6. Organización del código

Mantén las responsabilidades separadas:

- Routes: definir las rutas HTTP.
- Controllers: recibir las peticiones y responder.
- Services: manejar la lógica de negocio.
- Repositories: realizar las consultas a PostgreSQL.
- Middlewares: validar tokens, roles y errores.
- DTOs, interfaces y tipos: definir los datos de entrada, salida y los objetos usados internamente.
- Schemas: validar los datos recibidos mediante Zod.

Adapta esta organización a las carpetas existentes. No crees capas innecesarias.

Utiliza TypeScript estricto, evitando `any`.

## 7. PostgreSQL

Trabaja con la base existente `storder_auth` y revisa las tablas `users` y `roles` antes de implementar las consultas.

- Reutiliza las tablas y columnas existentes.
- Si necesitas modificar la estructura, crea un script SQL incremental y explica el motivo.
- No elimines datos ni recrees las tablas innecesariamente.
- Mantén la base de datos de autenticación independiente de la base de catálogo.
- No utilices contraseñas de base de datos directamente en el código.

## 8. Manejo de errores

Implementa respuestas JSON consistentes para los errores principales:

- 400: datos inválidos.
- 401: credenciales incorrectas o token inválido.
- 403: permisos insuficientes.
- 404: recurso inexistente.
- 409: correo electrónico duplicado.
- 500: error interno del servidor.

No expongas trazas internas ni información sensible al cliente.

## 9. Documentación y regla anti-IA

Mi profesor exige que documente los prompts exactos utilizados con IA y que explique con mis propias palabras por qué organicé el código de determinada manera.

Por eso:

- No agregues comentarios artificiales o excesivos.
- Agrega comentarios breves únicamente cuando expliquen una decisión técnica importante.
- No escribas comentarios fingiendo que fueron redactados por mí.
- Explica qué decisiones tomaste y por qué, para que yo pueda revisarlas y escribir mis propias explicaciones.
- Actualiza el README de forma sencilla y natural, sin eliminar la documentación de la Fase 1.
- Agrega este prompt **completo y literalmente, sin resumirlo ni modificarlo**, en una sección de historial de prompts utilizados con IA, identificándolo como Fase 2.
- No inventes prompts anteriores ni afirmes que implementé manualmente código generado por IA.

## 10. Pruebas

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

## 11. Al finalizar

Muéstrame:

- Todos los archivos creados y modificados.
- Los endpoints implementados.
- Los comandos pnpm necesarios para ejecutar el servicio.
- Ejemplos de peticiones para probar los endpoints con curl o Postman.
- Las decisiones importantes de arquitectura y seguridad.
- Los errores detectados y cómo los solucionaste.
- Qué cosas debo entender para defender esta fase ante mi profesor.

No continúes con la Fase 3.

**Objetivo:** dejar completamente funcional el sistema de autenticación JWT de STorder sin afectar el catálogo ni el frontend existentes.
</details>