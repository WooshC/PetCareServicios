# 🚀 README Deploy - PetCare

Guía completa de despliegue para el sistema PetCare con Docker, configuración de producción y monitoreo.

## ⚡ Despliegue Rápido

### 1️⃣ Instalación con Docker Compose
```bash
# Clonar repositorio
git clone https://github.com/WooshC/PetCareServicios.git
cd PetCareServicios

# Desplegar todo el stack
docker-compose up -d

# Verificar estado
curl http://localhost:5000/api/auth/health
```

### 2️⃣ Verificar Servicios
| Servicio | URL | Estado |
|----------|-----|--------|
| **🌐 API** | http://localhost:5000 | ✅ Activo |
| **📚 Swagger** | http://localhost:5000/swagger | ✅ Documentación |
| **🗄️ Base de Datos** | localhost:14433 | ✅ SQL Server |
| **🎨 Frontend** | http://localhost:3000 | ✅ React App |

## 🏗️ Arquitectura de Despliegue

### Stack Completo
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   React + Vite  │◄──►│   .NET 8 API    │◄──►│   SQL Server    │
│   Port: 3000    │    │   Port: 5000    │    │   Port: 14433   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Servicios Docker
- **petcare-frontend**: React application (Nginx)
- **petcare-api**: .NET 8 Web API
- **petcare-db**: SQL Server 2022

## 🔧 Configuración de Producción

### Variables de Entorno

#### Backend (.NET)
```bash
# JWT Configuration
JWT__KEY=YourSuperSecretKeyForJWTTokenGeneration
JWT__ISSUER=PetCareApp
JWT__AUDIENCE=PetCareUsers
JWT__EXPIRATIONHOURS=24

# Database Connections
CONNECTIONSTRINGS__DEFAULTCONNECTION=Server=petcare-db;Database=PetCareAuth;User=sa;Password=YourStrong@Passw0rd;TrustServerCertificate=True;
CONNECTIONSTRINGS__CUIDADORESCONNECTION=Server=petcare-db;Database=PetCareCuidadores;User=sa;Password=YourStrong@Passw0rd;TrustServerCertificate=True;

# Environment
ASPNETCORE_ENVIRONMENT=Production
ASPNETCORE_URLS=http://+:5000
```

#### Frontend (React)
```bash
# API URL
VITE_API_BASE_URL=http://localhost:5000/api

# Environment
NODE_ENV=production
```

### Docker Compose Completo

#### `docker-compose.full.yml`
```yaml
version: '3.8'

services:
  # Base de datos
  petcare-db:
    image: mcr.microsoft.com/mssql/server:2022-latest
    environment:
      - ACCEPT_EULA=Y
      - SA_PASSWORD=YourStrong@Passw0rd
    ports:
      - "14433:1433"
    volumes:
      - sql_data:/var/opt/mssql
    networks:
      - petcare-network

  # Backend API
  petcare-api:
    build:
      context: .
      dockerfile: Dockerfile
    environment:
      - ASPNETCORE_ENVIRONMENT=Production
      - ASPNETCORE_URLS=http://+:5000
      - JWT__KEY=YourSuperSecretKeyForJWTTokenGeneration
      - JWT__ISSUER=PetCareApp
      - JWT__AUDIENCE=PetCareUsers
      - JWT__EXPIRATIONHOURS=24
      - CONNECTIONSTRINGS__DEFAULTCONNECTION=Server=petcare-db;Database=PetCareAuth;User=sa;Password=YourStrong@Passw0rd;TrustServerCertificate=True;
      - CONNECTIONSTRINGS__CUIDADORESCONNECTION=Server=petcare-db;Database=PetCareCuidadores;User=sa;Password=YourStrong@Passw0rd;TrustServerCertificate=True;
    ports:
      - "5000:5000"
    depends_on:
      - petcare-db
    networks:
      - petcare-network
    restart: unless-stopped

  # Frontend
  petcare-frontend:
    build:
      context: ./PetCareFrond
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    depends_on:
      - petcare-api
    networks:
      - petcare-network
    restart: unless-stopped

volumes:
  sql_data:

networks:
  petcare-network:
    driver: bridge
```

## 🚀 Despliegue en Producción

### 1. Preparación del Servidor

#### Prerrequisitos
```bash
# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verificar instalación
docker --version
docker-compose --version
```

#### Configurar Firewall
```bash
# Abrir puertos necesarios
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 5000/tcp  # API
sudo ufw allow 3000/tcp  # Frontend
sudo ufw enable
```

### 2. Despliegue del Código

#### Opción A: Clonar Repositorio
```bash
# Clonar en servidor
git clone https://github.com/WooshC/PetCareServicios.git
cd PetCareServicios

# Configurar variables de entorno
cp .env.example .env
nano .env  # Editar variables
```

#### Opción B: Despliegue Automatizado
```bash
# Script de despliegue
#!/bin/bash
set -e

# Variables
REPO_URL="https://github.com/WooshC/PetCareServicios.git"
DEPLOY_DIR="/opt/petcare"
BACKUP_DIR="/opt/backups"

# Crear directorios
mkdir -p $DEPLOY_DIR $BACKUP_DIR

# Backup actual (si existe)
if [ -d "$DEPLOY_DIR" ]; then
    tar -czf $BACKUP_DIR/petcare-$(date +%Y%m%d-%H%M%S).tar.gz -C $DEPLOY_DIR .
fi

# Clonar/actualizar código
cd $DEPLOY_DIR
git clone $REPO_URL . || git pull

# Desplegar
docker-compose -f docker-compose.full.yml down
docker-compose -f docker-compose.full.yml up --build -d

# Verificar salud
sleep 30
curl -f http://localhost:5000/api/auth/health || exit 1

echo "Despliegue completado exitosamente"
```

### 3. Configuración de Nginx (Opcional)

#### Proxy Reverso
```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API
    location /api/ {
        proxy_pass http://localhost:5000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Swagger
    location /swagger/ {
        proxy_pass http://localhost:5000/swagger/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 4. SSL/HTTPS con Let's Encrypt

#### Instalar Certbot
```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d tu-dominio.com

# Renovar automáticamente
sudo crontab -e
# Agregar: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 📊 Monitoreo y Logs

### Logs de Aplicación
```bash
# Ver logs en tiempo real
docker-compose -f docker-compose.full.yml logs -f

# Logs específicos
docker-compose -f docker-compose.full.yml logs -f petcare-api
docker-compose -f docker-compose.full.yml logs -f petcare-frontend
docker-compose -f docker-compose.full.yml logs -f petcare-db

# Exportar logs
docker-compose -f docker-compose.full.yml logs > logs.txt
```

### Métricas de Rendimiento
```bash
# Uso de recursos
docker stats

# Espacio en disco
df -h

# Memoria del sistema
free -h

# CPU y procesos
top
```

### Health Checks
```bash
# API Health
curl -f http://localhost:5000/api/auth/health

# Frontend (si está en Docker)
curl -f http://localhost:3000

# Base de datos
docker exec petcareservicios-db-1 /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P YourStrong@Passw0rd -Q "SELECT 1"
```

## 🔄 Backup y Restauración

### Backup de Base de Datos
```bash
#!/bin/bash
# Script de backup

BACKUP_DIR="/opt/backups/database"
DATE=$(date +%Y%m%d-%H%M%S)

mkdir -p $BACKUP_DIR

# Backup PetCareAuth
docker exec petcareservicios-db-1 /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P YourStrong@Passw0rd \
  -Q "BACKUP DATABASE PetCareAuth TO DISK = '/var/opt/mssql/backup/PetCareAuth-$DATE.bak'"

# Backup PetCareCuidadores
docker exec petcareservicios-db-1 /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P YourStrong@Passw0rd \
  -Q "BACKUP DATABASE PetCareCuidadores TO DISK = '/var/opt/mssql/backup/PetCareCuidadores-$DATE.bak'"

# Copiar backups al host
docker cp petcareservicios-db-1:/var/opt/mssql/backup/. $BACKUP_DIR/

# Limpiar backups antiguos (mantener últimos 7 días)
find $BACKUP_DIR -name "*.bak" -mtime +7 -delete

echo "Backup completado: $BACKUP_DIR"
```

### Restauración
```bash
#!/bin/bash
# Script de restauración

BACKUP_FILE=$1
if [ -z "$BACKUP_FILE" ]; then
    echo "Uso: $0 <archivo_backup>"
    exit 1
fi

# Restaurar base de datos
docker exec -i petcareservicios-db-1 /opt/mssql-tools/bin/sqlcmd \
  -S localhost -U sa -P YourStrong@Passw0rd \
  -i $BACKUP_FILE

echo "Restauración completada"
```

## 🔧 Mantenimiento

### Actualizaciones
```bash
# Actualizar código
git pull origin main

# Reconstruir y reiniciar
docker-compose -f docker-compose.full.yml down
docker-compose -f docker-compose.full.yml up --build -d

# Verificar funcionamiento
sleep 30
curl -f http://localhost:5000/api/auth/health
```

### Limpieza
```bash
# Limpiar imágenes no utilizadas
docker image prune -f

# Limpiar contenedores detenidos
docker container prune -f

# Limpiar volúmenes no utilizados
docker volume prune -f

# Limpiar todo
docker system prune -a -f
```

### Escalado
```bash
# Escalar API (si es necesario)
docker-compose -f docker-compose.full.yml up -d --scale petcare-api=3

# Configurar load balancer
# Usar Nginx o HAProxy para distribuir carga
```

## 🐛 Troubleshooting

### Problemas Comunes

#### 1. Contenedores No Inician
```bash
# Verificar logs
docker-compose -f docker-compose.full.yml logs

# Verificar recursos
docker system df
df -h

# Reiniciar Docker
sudo systemctl restart docker
```

#### 2. Base de Datos No Conecta
```bash
# Verificar que SQL Server esté ejecutándose
docker ps | grep petcare-db

# Verificar logs de base de datos
docker-compose -f docker-compose.full.yml logs petcare-db

# Conectar manualmente
docker exec -it petcareservicios-db-1 /opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P YourStrong@Passw0rd
```

#### 3. API No Responde
```bash
# Verificar logs de API
docker-compose -f docker-compose.full.yml logs petcare-api

# Verificar migraciones
docker-compose -f docker-compose.full.yml exec petcare-api dotnet ef database update --context AppDbContext
docker-compose -f docker-compose.full.yml exec petcare-api dotnet ef database update --context CuidadoresDbContext

# Verificar configuración
docker-compose -f docker-compose.full.yml exec petcare-api env | grep -E "(JWT|CONNECTION)"
```

#### 4. Frontend No Se Conecta
```bash
# Verificar logs de frontend
docker-compose -f docker-compose.full.yml logs petcare-frontend

# Verificar configuración de API
docker-compose -f docker-compose.full.yml exec petcare-frontend env | grep VITE_API

# Verificar conectividad
docker-compose -f docker-compose.full.yml exec petcare-frontend curl -f http://petcare-api:5000/api/auth/health
```

### Comandos de Recuperación
```bash
# Reiniciar todo
docker-compose -f docker-compose.full.yml restart

# Reconstruir todo
docker-compose -f docker-compose.full.yml down
docker-compose -f docker-compose.full.yml up --build -d

# Resetear base de datos
docker-compose -f docker-compose.full.yml down -v
docker-compose -f docker-compose.full.yml up -d
```

## 📈 Optimización

### Configuración de Producción

#### Backend (.NET)
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Warning",
      "Microsoft": "Warning",
      "Microsoft.Hosting.Lifetime": "Information"
    }
  },
  "AllowedHosts": "*",
  "Kestrel": {
    "Limits": {
      "MaxConcurrentConnections": 100,
      "MaxConcurrentUpgradedConnections": 100
    }
  }
}
```

#### Frontend (Nginx)
```nginx
# Optimización de archivos estáticos
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
    gzip_static on;
}

# Compresión Gzip
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_proxied expired no-cache no-store private must-revalidate auth;
gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss;
```

### Monitoreo Avanzado

#### Prometheus + Grafana
```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

#### Logs Centralizados
```yaml
# docker-compose.logging.yml
version: '3.8'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.17.0

  kibana:
    image: docker.elastic.co/kibana/kibana:7.17.0
    ports:
      - "5601:5601"

  filebeat:
    image: docker.elastic.co/beats/filebeat:7.17.0
    volumes:
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
```

---

<div align="center">
  <p>🚀 <strong>Deploy PetCare</strong></p>
  <p>✨ Docker + Production + Monitoring</p>
  <p>🔧 Backup + Maintenance + Scaling</p>
  <p>📊 Logs + Metrics + Health Checks</p>
</div> 