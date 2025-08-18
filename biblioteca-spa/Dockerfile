# Frontend Dockerfile
FROM node:18-alpine

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer puerto
EXPOSE 3001

# Comando para iniciar en modo desarrollo
CMD ["npm", "run", "dev"]