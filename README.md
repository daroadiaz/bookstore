# Bookstore – Moleculer (API) + Nuxt 3 (SPA) + MongoDB

Proyecto monorepo con **backend** en [Moleculer](https://moleculer.services/), **frontend** en **Nuxt 3 (SPA)** y **MongoDB** como base de datos.  
Existe además una **rama `docker` en proceso** para orquestar servicios con contenedores.

## Requisitos

- **Node.js 18.x** (recomendado usar `nvm` o `nvs`)
- **npm** (viene con Node)
- **MongoDB** en local (por defecto `mongodb://127.0.0.1:27017/bookstore_db`)
- (Opcional) **Docker Desktop** si vas a revisar la rama `docker`

## Estructura del repositorio

```
bookstore/
├─ biblioteca-spa/           # Frontend Nuxt 3 (SPA)
├─ bookstore-api/            # Backend Moleculer (API)
├─ Bookstore API.postman_collection.json
├─ .gitignore
├─ .gitattributes
└─ README.md
```

## Variables de entorno

### Backend (`bookstore-api/.env`)
```ini
NODE_ENV=development
PORT=3000
MONGO_URI=mongodb://127.0.0.1:27017/bookstore_db
MOLECULER_LOG_LEVEL=info
# Si usas moleculer-web / gateway, ajusta aquí CORS si es necesario
```

> El adaptador por defecto del ejemplo usa `mongodb://127.0.0.1:27017/bookstore_db`. Si cambias la DB, actualiza `MONGO_URI`.

### Frontend (`biblioteca-spa/.env`)
```ini
# URL base del API (debe apuntar al backend)
NUXT_PUBLIC_API_BASE_URL=http://localhost:3000

# Si personalizas el puerto del dev server, ajusta también:
NITRO_PORT=3001
```

> El SPA corre por defecto en **http://localhost:3001** y consume el backend en **http://localhost:3000**.

## Puesta en marcha (TL;DR)

En **dos terminales** distintas:

### 1) Backend (Moleculer)
```bash
cd bookstore-api
npm i
npm run dev
```

### 2) Frontend (Nuxt 3 SPA)
```bash
cd biblioteca-spa
npm i
npm run dev
```

Ahora deberías tener:
- API: `http://localhost:3000`
- SPA: `http://localhost:3001`

Asegúrate de que `NUXT_PUBLIC_API_BASE_URL` apunte al puerto del API.

## Importar colección Postman

1. Abre Postman.
2. **Import** → selecciona `Bookstore API.postman_collection.json`.
3. Ejecuta las requests contra `http://localhost:3000` (o el host/puerto que uses).

## Scripts útiles

En **backend** (`bookstore-api`):
- `npm run dev` – inicia el servicio Moleculer en modo desarrollo.

En **frontend** (`biblioteca-spa`):
- `npm run dev` – inicia el servidor de desarrollo de Nuxt (SPA).

## Rama Docker (en progreso)

Hay una rama **`docker`** en construcción para levantar **API + SPA + MongoDB** con `docker compose`.

```bash
git fetch
git checkout docker
# Revisa el README específico de la rama si está disponible.
```

> Como está **en proceso**, la configuración puede cambiar. La rama principal funciona sin Docker.

## Solución de problemas

- **El navegador muestra las requests en “pending”**:
  - Verifica que el **API esté corriendo** en el puerto configurado (por defecto 3000).
  - Confirma que `NUXT_PUBLIC_API_BASE_URL` en el **frontend** apunta al **backend** correcto.
  - Si usas un gateway (moleculer-web), revisa **CORS** y el **path base** (por ejemplo `/api`).
- **MongoDB no conecta**:
  - Asegúrate de que el servicio de MongoDB esté iniciado en `127.0.0.1:27017`.
  - Revisa `MONGO_URI` y credenciales si usas autenticación.
- **Puertos en uso**:
  - Cambia `PORT` (API) o `NITRO_PORT`/`devServer.port` (SPA) o libera los puertos ocupados.

## Convenciones

- **Node 18** para ambos proyectos.
- **Commits** claros por carpeta (ej.: `api: ...`, `spa: ...`).
- Issues/PRs bien descritos; si tocan Docker, etiquetar con `docker`.
