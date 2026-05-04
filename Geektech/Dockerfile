FROM node:18-alpine

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Construir la aplicación Next.js
RUN npm run build

# Exponer el puerto por defecto de Next.js
EXPOSE 3000

# Iniciar la aplicación
CMD ["npm", "start"]
