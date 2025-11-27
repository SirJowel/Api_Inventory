# 🚂 Guía de Migraciones en Railway

## ⚠️ Problema Resuelto: "relation \"users\" does not exist"

Este error ocurría porque las tablas no se creaban automáticamente en Railway.

## ✅ Solución Implementada

### 1. **Migración Automática al Iniciar**
La aplicación ahora ejecuta automáticamente las migraciones al iniciar en Railway.

En `src/index.ts`:
```typescript
// Ejecutar migraciones pendientes automáticamente
await AppDataSource.runMigrations();
```

### 2. **Configuración de `synchronize`**
```typescript
// src/config/db.ts
synchronize: process.env.NODE_ENV === 'development'
```

- **Desarrollo local**: `true` (crea tablas automáticamente)
- **Railway (producción)**: `false` (usa migraciones)

### 3. **Migración Inicial Creada**
Archivo: `src/migrations/1732723200000-InitialSchema.ts`

Crea las siguientes tablas:
- ✅ **users** (id, name, email, password, role, timestamps)
- ✅ **categories** (id, name, description, timestamps)
- ✅ **products** (id, name, description, price, stock, imageUrl, categoryId, timestamps)

Incluye:
- Foreign keys (products → categories)
- Índices para búsquedas rápidas
- Extensión UUID

## 📋 Variables de Entorno en Railway

Asegúrate de tener:
```env
NODE_ENV=production
DB_HOST=${{PGHOST}}
DB_PORT=${{PGPORT}}
DB_USER=${{PGUSER}}
DB_PASSWORD=${{PGPASSWORD}}
DB_NAME=${{PGDATABASE}}
```

## 🔧 Comandos de Migración (opcional)

Si necesitas ejecutar migraciones manualmente:

```bash
# Ver migraciones pendientes
npm run typeorm migration:show

# Ejecutar migraciones
npm run migration:run

# Revertir última migración
npm run migration:revert

# Crear nueva migración
npm run migration:create -- src/migrations/NombreMigracion

# Generar migración desde cambios en entidades
npm run migration:generate -- src/migrations/NombreMigracion
```

## 🚀 Deploy en Railway

### Primer Deploy
1. Haz push de los cambios:
   ```bash
   git add .
   git commit -m "Add automatic migrations"
   git push
   ```

2. Railway detectará los cambios y redesplegará automáticamente

3. Verifica en los logs de Railway:
   ```
   🔄 Ejecutando migraciones...
   ✅ Migraciones ejecutadas correctamente
   ```

### Deployments Posteriores
- Las migraciones se ejecutan automáticamente en cada deploy
- Si no hay migraciones nuevas, simplemente se omiten
- No hay downtime significativo

## 📊 Verificar que Funciona

1. **En Railway Logs**, deberías ver:
   ```
   ✅ Base de datos conectada
   🔄 Ejecutando migraciones...
   ✅ Migraciones ejecutadas correctamente
   🚀 Servidor corriendo en puerto 3000
   ```

2. **Prueba crear un usuario**:
   ```bash
   curl -X POST https://tu-app.railway.app/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test User",
       "email": "test@example.com",
       "password": "password123"
     }'
   ```

3. **Si funciona**, recibirás:
   ```json
   {
     "success": true,
     "message": "Usuario creado exitosamente",
     "data": { ... }
   }
   ```

## 🔍 Troubleshooting

### Error: "Migration has already been applied"
- Normal. Significa que las migraciones ya están en la BD
- La app continuará iniciando normalmente

### Error: "QueryFailedError: relation already exists"
Si ves este error:
1. Las tablas ya existen en Railway
2. La migración intentó crearlas de nuevo
3. **Solución**: Las migraciones ahora usan `CREATE TABLE IF NOT EXISTS`

### Verificar estado de la base de datos
Conéctate a PostgreSQL en Railway:
```bash
# Desde Railway Dashboard > Database > Connect > PSQL Command
psql ${{DATABASE_URL}}

# Ver tablas
\dt

# Ver estructura de tabla users
\d users
```

## 🎯 Mejores Prácticas

1. **Nunca uses `synchronize: true` en producción**
   - Puede causar pérdida de datos
   - Usa migraciones controladas

2. **Prueba migraciones localmente primero**
   ```bash
   npm run migration:run
   ```

3. **Guarda migraciones en control de versiones**
   - Siempre haz commit de las migraciones
   - No las modifiques una vez aplicadas

4. **Crea migraciones incrementales**
   - Una migración por cambio lógico
   - Nombres descriptivos

## 📝 Próximos Pasos

Si necesitas agregar más tablas (Sales, SaleDetails, etc.):

1. Crea las entidades en `src/entities/`
2. Genera la migración:
   ```bash
   npm run migration:generate -- src/migrations/AddSalesTables
   ```
3. Revisa el archivo generado
4. Haz commit y push
5. Railway aplicará la migración automáticamente

---

**✅ Ahora tu aplicación en Railway creará las tablas automáticamente al iniciar**
