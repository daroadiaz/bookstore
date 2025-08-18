# README

## 📋 Requisitos Previos

- Docker
- Docker Compose

## 🚀 Instalación y Despliegue

### Compilar el Proyecto

Para compilar el proyecto, ejecuta el siguiente comando:

```bash
docker-compose build
```

### Desplegar el Proyecto

Para iniciar y desplegar el proyecto, utiliza:

```bash
docker-compose up
```

Para ejecutar en segundo plano (modo detached):

```bash
docker-compose up -d
```

## 🔐 Credenciales de Acceso

Las credenciales por defecto para acceder al sistema son:

- **Usuario:** `admin`
- **Contraseña:** `admin123`

> ⚠️ **Importante:** Se recomienda cambiar estas credenciales por defecto después del primer inicio de sesión por motivos de seguridad.

## 🛑 Detener el Proyecto

Para detener los contenedores:

```bash
docker-compose down
```

Para detener y eliminar volúmenes:

```bash
docker-compose down -v
```

## 📝 Notas Adicionales

- Asegúrate de tener los puertos necesarios disponibles antes de iniciar el proyecto
- Revisa los logs con `docker-compose logs` en caso de errores
- Para reconstruir desde cero, usa `docker-compose build --no-cache`