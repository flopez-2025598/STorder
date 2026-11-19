# STorder — Sistema Distribuido de Gestión de Pedidos e Inventario

STorder combina *Stock* (inventario) y *Order* (pedido). La Fase 1 prepara el monorepositorio, el esquema inicial y el panel operativo.

| Aplicación | Dirección local | Responsabilidad |
| --- | --- | --- |
| `auth-service` | `http://127.0.0.1:3001` | Usuarios y roles en `storder_auth`. Configuración opcional para el futuro secreto JWT. |
| `catalog-service` | `http://127.0.0.1:3002` | Categorías, productos, existencias, pedidos y líneas de pedido en `storder_catalog`. |
| `frontend-client` | `http://localhost:4200` | Panel standalone con Angular Router, HttpClient y estado de las APIs. |

Los servicios tienen procesos, variables de entorno, roles PostgreSQL y pools propios. El identificador del cliente en un pedido se guarda como UUID externo. El esquema de catálogo puede instalarse independientemente del esquema de autenticación.

```text
storder/
├── auth-service/
│   ├── src/{config,controllers,services,repositories,models,dtos,middlewares,routes}/
│   └── src/{app.ts,server.ts}
├── catalog-service/
│   ├── src/{config,controllers,services,repositories,models,dtos,middlewares,routes}/
│   └── src/{app.ts,server.ts}
├── frontend-client/
│   ├── src/app/{components,services,models,guards,interceptors}/
│   └── src/environments/environment.ts
├── database/{auth.sql,catalog.sql,seeds.sql}
├── package.json
└── README.md
```

## Instalación local

Usa Node.js 26, npm y PostgreSQL 18. La CLI de Angular se instala en el monorepositorio. Desde la raíz, en Bash o fish:

```sh
npm ci
cp auth-service/.env.example auth-service/.env
cp catalog-service/.env.example catalog-service/.env
```

Con PostgreSQL iniciado, ejecuta los siguientes comandos con una cuenta administradora del servidor local. Configura una contraseña distinta para cada rol cuando `createuser` la solicite y copia cada contraseña en el `DB_PASSWORD` del servicio correspondiente. Si tu cuenta administradora tiene otro nombre, sustituye `postgres` en `-U postgres`.

```sh
createuser -U postgres --pwprompt storder_auth_app
createuser -U postgres --pwprompt storder_catalog_app
createdb -U postgres --owner=storder_auth_app storder_auth
createdb -U postgres --owner=storder_catalog_app storder_catalog
psql -X -U postgres -d postgres -f database/auth.sql
psql -X -U postgres -d postgres -f database/catalog.sql
psql -X -U postgres -d postgres -f database/seeds.sql
```

Los esquemas y las semillas se pueden ejecutar de nuevo. Los datos iniciales crean los roles de aplicación `admin` y `operator` y dos categorías. Si el acceso del administrador local se autentica por usuario del sistema, ejecuta los comandos de PostgreSQL desde su cuenta o agrega `-h 127.0.0.1` con una credencial de administrador habilitada para TCP.

## Desarrollo y compilación

Abre tres terminales desde la raíz y ejecuta un comando en cada una.

```sh
npm run dev:auth
npm run dev:catalog
npm run dev:frontend
```

Para compilar los tres proyectos y ejecutar los servicios compilados en terminales independientes:

```sh
npm run build
npm start -w auth-service
npm start -w catalog-service
```

La salida está en `auth-service/dist`, `catalog-service/dist` y `frontend-client/dist/storder/browser`. Si cambias las direcciones locales, ajusta `frontend-client/src/environments/environment.ts` y `CORS_ORIGIN` en ambos servicios.

## Verificación

```sh
node --version
npm --version
npm exec -w frontend-client -- ng version
psql --version
psql -X -h 127.0.0.1 -U storder_auth_app -d storder_auth -c 'SELECT current_database();'
psql -X -h 127.0.0.1 -U storder_catalog_app -d storder_catalog -c 'SELECT current_database();'
curl -fsS http://127.0.0.1:3001/api/health
curl -fsS http://127.0.0.1:3002/api/health
```

Cada endpoint de salud consulta PostgreSQL. Devuelve HTTP 200 si la consulta responde y HTTP 503 si la base de datos está inaccesible.

## Prompt original de la Fase 1

````text
Actúa como un desarrollador senior especializado en Node.js, TypeScript, PostgreSQL, Angular y arquitectura de microservicios.
Necesito desarrollar STorder — Sistema Distribuido de Gestión de Pedidos e Inventario, siguiendo estrictamente los requisitos del PDF adjunto.
El nombre STorder proviene de la combinación de Stock (inventario) y Order (pedido). Debe utilizarse de forma consistente en el proyecto, el frontend, la documentación y el repositorio.
Trabajaremos por fases. Implementa código funcional, limpio, organizado y mantenible. No generes todo el proyecto de una sola vez.
1. Crear la estructura inicial del proyecto utilizando un monorepositorio llamado storder.
2. Configurar dos microservicios independientes: auth-service y catalog-service.
3. Inicializar el frontend con Angular y componentes standalone.
4. Configurar TypeScript en modo estricto.
5. Configurar dos bases de datos independientes en PostgreSQL.
6. Crear los scripts SQL iniciales.
7. Configurar las variables de entorno.
8. Preparar los comandos para ejecutar cada servicio.
- Nombre: STorder
- Nombre completo: STorder — Sistema Distribuido de Gestión de Pedidos e Inventario.
- Repositorio: STorder
- Carpeta raíz: storder/
- Base de datos de autenticación: storder_auth
- Base de datos de catálogo: storder_catalog
- Nombre visible en Angular: STorder
Utiliza el nombre STorder de manera consistente. Los nombres técnicos de archivos, carpetas y bases de datos deben respetar las convenciones correspondientes.
auth-service
- Node.js + TypeScript + Express.
- PostgreSQL: storder_auth.
- Puerto 3001.
- Configuración inicial para autenticación JWT y roles.
catalog-service
- Node.js + TypeScript + Express.
- PostgreSQL: storder_catalog.
- Puerto 3002.
- Configuración inicial para productos, inventario y pedidos.
frontend-client
- Angular con componentes standalone.
- Routing configurado.
- HttpClient configurado.
- Estructura preparada para servicios, guards e interceptores.
- Nombre STorder configurado como identidad de la aplicación.
Ambos microservicios deben ser completamente independientes.
```text
storder/
├── auth-service/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── models/
│   │   ├── dtos/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   └── app.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── catalog-service/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── models/
│   │   ├── dtos/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   └── app.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── frontend-client/
├── database/
│   ├── auth.sql
│   ├── catalog.sql
│   └── seeds.sql
├── README.md
└── .gitignore
```
Puedes realizar ajustes estructurales justificados si son necesarios.
Crear dos bases de datos independientes:
storder_auth
- Usuarios.
- Roles.
- Restricciones e índices.
storder_catalog
- Categorías.
- Productos.
- Pedidos.
- Detalles de pedidos.
- Llaves primarias y foráneas.
- Restricciones e índices.
Genera scripts SQL ejecutables, organizados y preparados para su entrega.
No debe existir acoplamiento directo entre las bases de datos.
Cada microservicio debe conectarse únicamente a su propia base de datos.
- Express.js.
- TypeScript estricto.
- PostgreSQL mediante pg.
- Zod para futuras validaciones.
- dotenv.
- CORS.
- Manejo básico de errores.
- Endpoint GET /api/health en cada microservicio.
- Scripts npm para desarrollo, compilación y ejecución.
- Crear un proyecto Angular funcional.
- Componentes standalone.
- Configurar Angular Router.
- Configurar HttpClient.
- Preparar carpetas para componentes, servicios, modelos, guards e interceptores.
- Configurar las URLs de ambos microservicios.
- Configurar STorder como nombre visible de la aplicación.
- Preparar una estructura visual inicial limpia y profesional, orientada a la gestión de pedidos, productos y bodegas.
- Código real y ejecutable.
- No utilizar pseudocódigo.
- No implementar todavía login, registro, CRUD ni JWT.
- No agregar dependencias innecesarias.
- No utilizar Docker.
- Crear archivos .env.example.
- Configurar .gitignore.
- Crear README.md con instrucciones de instalación y ejecución.
- Registrar literalmente este prompt en el README.md.
- Mantener el código organizado, modular y tipado.
- No realizar instalaciones globales sin autorización.
- Utilizar el nombre STorder en el proyecto y su documentación.
- Mantener los dos microservicios completamente independientes.
Antes de finalizar:
1. Verifica las versiones instaladas de Node.js, npm, Angular CLI y PostgreSQL.
2. Instala las dependencias necesarias.
3. Comprueba la compilación de TypeScript.
4. Comprueba las conexiones a PostgreSQL.
5. Verifica los endpoints de salud.
6. Verifica la compilación de Angular.
7. Corrige cualquier error encontrado.
8. Informa qué pruebas se ejecutaron correctamente.
Si tienes acceso a la terminal, realiza directamente los cambios y pruebas. En caso contrario, proporciona los comandos para CachyOS Linux utilizando fish shell.
Al finalizar, proporciona:
- Estructura de carpetas creada.
- Archivos principales implementados.
- Scripts SQL.
- Comandos para ejecutar los tres componentes.
- Resultados de las verificaciones.
- Breve explicación técnica de la arquitectura.
- Estado de cumplimiento de la Fase 1.
````
