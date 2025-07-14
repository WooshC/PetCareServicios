# Etapa 1: build
FROM node:18 AS build
WORKDIR /app

# Primero copia solo los archivos necesarios para npm install (mejora el caching)
COPY package*.json ./
RUN npm install

# Luego copia el resto y haz el build
COPY . .
RUN npm run build

# Verifica que el directorio dist existe (nuevo paso)
RUN ls -la /app/dist || (echo "Error: No se generó el directorio dist" && exit 1)

# Etapa 2: producción con NGINX
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]