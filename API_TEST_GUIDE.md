# 📚 Guía de Testing de API - Sistema de Inventario

> **Base URL**: `http://localhost:3000/api` (desarrollo) o `https://tu-app.railway.app/api` (producción)

## 📑 Tabla de Contenidos

- [Autenticación](#-autenticación)
- [Usuarios (Users)](#-usuarios-users)
- [Productos (Products)](#-productos-products)
- [Categorías (Categories)](#-categorías-categories)
- [Códigos de Estado HTTP](#-códigos-de-estado-http)
- [Tips de Testing](#-tips-de-testing)

---

## 🔐 Autenticación

Todos los endpoints (excepto registro y login) requieren un token JWT en el header:

```
Authorization: Bearer <tu-token-jwt>
```

### 1. Registro de Usuario

```bash
POST /api/users
Content-Type: application/json
```

**Body - Usuario Regular:**
```json
{
  "name": "Juan Pérez",
  "email": "juan@example.com",
  "password": "Password123!",
  "rol": "user"
}
```

**Body - Administrador:**
```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "AdminPass123!",
  "rol": "admin"
}
```

**Respuesta Exitosa (201):**
```json
{
  "success": true,
  "message": "Usuario creado exitosamente",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "role": "user",
    "createdAt": "2025-11-27T10:30:00Z",
    "updatedAt": "2025-11-27T10:30:00Z"
  }
}
```

### 2. Login

```bash
POST /api/users/login
Content-Type: application/json
```

**Body:**
```json
{
  "email": "juan@example.com",
  "password": "Password123!"
}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU1MGU4NDAwLWUyOWItNDFkNC1hNzE2LTQ0NjY1NTQ0MDAwMCIsImVtYWlsIjoianVhbkBleGFtcGxlLmNvbSIsInJvbGUiOiJ1c2VyIn0..."
}
```

> **⚠️ Importante:** Guarda el `token` de la respuesta para usarlo en los siguientes requests.

---

## 👥 Usuarios (Users)

### 3. Listar Usuarios

```bash
GET /api/users?page=1&limit=10
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Elementos por página (default: 10, max: 100)
- `search` (opcional): Buscar por nombre o email

**Ejemplo con búsqueda:**
```bash
GET /api/users?page=1&limit=10&search=juan
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Usuarios obtenidos exitosamente",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Juan Pérez",
      "email": "juan@example.com",
      "role": "user",
      "createdAt": "2025-11-27T10:30:00Z",
      "updatedAt": "2025-11-27T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

### 4. Obtener Usuario por ID

```bash
GET /api/users/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <token>
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Usuario obtenido exitosamente",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Juan Pérez",
    "email": "juan@example.com",
    "role": "user",
    "createdAt": "2025-11-27T10:30:00Z",
    "updatedAt": "2025-11-27T10:30:00Z"
  }
}
```

### 5. Obtener Usuarios por Rol (Solo Admin)

```bash
GET /api/users/role/user
Authorization: Bearer <token-admin>
```

**Roles válidos:** `admin`, `manager`, `user`

### 6. Actualizar Usuario

```bash
PUT /api/users/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <token>
Content-Type: application/json
```

**Body - Actualizar Nombre:**
```json
{
  "name": "Juan Carlos Pérez"
}
```

**Body - Actualizar Email:**
```json
{
  "email": "juan.carlos@example.com"
}
```

**Body - Actualizar Contraseña:**
```json
{
  "password": "NewPassword123!"
}
```

**Body - Actualización Completa:**
```json
{
  "name": "Juan Carlos Pérez",
  "email": "juan.carlos@example.com",
  "password": "NewPassword123!",
  "rol": "manager"
}
```

### 7. Eliminar Usuario (Solo Admin)

```bash
DELETE /api/users/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <token-admin>
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Usuario eliminado exitosamente",
  "data": null
}
```

---

## 📦 Productos (Products)

### 8. Crear Producto

```bash
POST /api/products
Authorization: Bearer <token>
Content-Type: application/json
```

**Body - Producto Simple:**
```json
{
  "name": "iPhone 14 Pro",
  "description": "Smartphone Apple iPhone 14 Pro 128GB",
  "price": 999.99,
  "stock": 50,
  "minStock": 10,
  "barcode": "1234567890123"
}
```

**Body - Producto con Categoría:**
```json
{
  "name": "MacBook Pro 16",
  "description": "Laptop Apple MacBook Pro 16 pulgadas M2 Pro",
  "price": 2499.99,
  "stock": 15,
  "minStock": 3,
  "barcode": "9876543210987",
  "categoryId": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Respuesta Exitosa (201):**
```json
{
  "success": true,
  "message": "Producto creado exitosamente",
  "data": {
    "id": "abc12345-e89b-12d3-a456-426614174000",
    "name": "iPhone 14 Pro",
    "description": "Smartphone Apple iPhone 14 Pro 128GB",
    "price": 999.99,
    "stock": 50,
    "minStock": 10,
    "barcode": "1234567890123",
    "imageUrl": null,
    "categoryId": null,
    "createdAt": "2025-11-27T10:30:00Z",
    "updatedAt": "2025-11-27T10:30:00Z"
  }
}
```

### 9. Crear Producto con Imagen

```bash
POST /api/products
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
```
name: iPhone 14 Pro
description: Smartphone Apple iPhone 14 Pro 128GB
price: 999.99
stock: 50
minStock: 10
barcode: 1234567890123
categoryId: 123e4567-e89b-12d3-a456-426614174000
image: [archivo.jpg] (máx 5MB)
```

**Ejemplo con cURL:**
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Authorization: Bearer <token>" \
  -F "name=iPhone 14 Pro" \
  -F "description=Smartphone Apple" \
  -F "price=999.99" \
  -F "stock=50" \
  -F "minStock=10" \
  -F "barcode=1234567890123" \
  -F "image=@/path/to/image.jpg"
```

### 10. Listar Productos

```bash
GET /api/products?page=1&limit=10
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (opcional): Número de página
- `limit` (opcional): Elementos por página
- `search` (opcional): Buscar por nombre o descripción
- `categoryId` (opcional): Filtrar por categoría
- `minPrice` (opcional): Precio mínimo
- `maxPrice` (opcional): Precio máximo
- `sortBy` (opcional): Campo para ordenar (`name`, `price`, `stock`, `createdAt`)
- `sortOrder` (opcional): Orden (`asc`, `desc`)

**Ejemplo con Filtros:**
```bash
GET /api/products?search=iPhone&minPrice=500&maxPrice=1500&sortBy=price&sortOrder=asc
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Productos obtenidos exitosamente",
  "data": [
    {
      "id": "abc12345-e89b-12d3-a456-426614174000",
      "name": "iPhone 14 Pro",
      "description": "Smartphone Apple iPhone 14 Pro 128GB",
      "price": 999.99,
      "stock": 50,
      "minStock": 10,
      "barcode": "1234567890123",
      "imageUrl": "/uploads/image-1234567890.jpg",
      "categoryId": "123e4567-e89b-12d3-a456-426614174000",
      "category": {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "name": "Electrónicos"
      },
      "createdAt": "2025-11-27T10:30:00Z",
      "updatedAt": "2025-11-27T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "pages": 1
  }
}
```

### 11. Obtener Producto por ID

```bash
GET /api/products/abc12345-e89b-12d3-a456-426614174000
Authorization: Bearer <token>
```

### 12. Buscar Producto por Código de Barras

```bash
GET /api/products/barcode/1234567890123
Authorization: Bearer <token>
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Producto encontrado",
  "data": {
    "id": "abc12345-e89b-12d3-a456-426614174000",
    "name": "iPhone 14 Pro",
    "barcode": "1234567890123",
    "price": 999.99,
    "stock": 50
  }
}
```

### 13. Productos con Stock Bajo

```bash
GET /api/products/low-stock?page=1&limit=10
Authorization: Bearer <token>
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Productos con stock bajo obtenidos",
  "data": [
    {
      "id": "abc12345-e89b-12d3-a456-426614174000",
      "name": "iPhone 14 Pro",
      "stock": 8,
      "minStock": 10,
      "lowStockAlert": true
    }
  ]
}
```

### 14. Actualizar Producto

```bash
PUT /api/products/abc12345-e89b-12d3-a456-426614174000
Authorization: Bearer <token>
Content-Type: application/json
```

**Body - Actualizar Precio:**
```json
{
  "price": 1099.99
}
```

**Body - Actualizar Stock:**
```json
{
  "stock": 25,
  "minStock": 5
}
```

**Body - Actualización Completa:**
```json
{
  "name": "iPhone 14 Pro Max",
  "description": "Smartphone Apple iPhone 14 Pro Max 256GB",
  "price": 1199.99,
  "stock": 30,
  "minStock": 5,
  "barcode": "1234567890124",
  "categoryId": "123e4567-e89b-12d3-a456-426614174000"
}
```

### 15. Actualizar Stock del Producto

```bash
PATCH /api/products/abc12345-e89b-12d3-a456-426614174000/stock
Authorization: Bearer <token>
Content-Type: application/json
```

**Body - Aumentar Stock (Entrada de mercancía):**
```json
{
  "quantity": 50,
  "operation": "add"
}
```

**Body - Disminuir Stock (Venta o merma):**
```json
{
  "quantity": 5,
  "operation": "subtract"
}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Stock actualizado exitosamente",
  "data": {
    "id": "abc12345-e89b-12d3-a456-426614174000",
    "name": "iPhone 14 Pro",
    "stock": 55,
    "previousStock": 50,
    "newStock": 55
  }
}
```

### 16. Eliminar Producto

```bash
DELETE /api/products/abc12345-e89b-12d3-a456-426614174000
Authorization: Bearer <token>
```

---

## 📂 Categorías (Categories)

### 17. Crear Categoría

```bash
POST /api/categories
Authorization: Bearer <token>
Content-Type: application/json
```

**Body - Categoría con Descripción:**
```json
{
  "name": "Electrónicos",
  "description": "Productos electrónicos y tecnológicos"
}
```

**Body - Categoría Simple:**
```json
{
  "name": "Ropa"
}
```

**Respuesta Exitosa (201):**
```json
{
  "success": true,
  "message": "Categoría creada exitosamente",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Electrónicos",
    "description": "Productos electrónicos y tecnológicos",
    "createdAt": "2025-11-27T10:30:00Z",
    "updatedAt": "2025-11-27T10:30:00Z"
  }
}
```

### 18. Listar Categorías

```bash
GET /api/categories?page=1&limit=10
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (opcional): Número de página
- `limit` (opcional): Elementos por página
- `search` (opcional): Buscar por nombre o descripción
- `includeInactive` (opcional): Incluir categorías inactivas (true/false)
- `sortBy` (opcional): Campo para ordenar (`name`, `createdAt`, `updatedAt`)
- `sortOrder` (opcional): Orden (`asc`, `desc`)

**Ejemplo con Búsqueda:**
```bash
GET /api/categories?search=electrónicos&sortBy=name&sortOrder=asc
```

### 19. Obtener Categorías Activas

```bash
GET /api/categories/active?page=1&limit=10
Authorization: Bearer <token>
```

### 20. Obtener Categoría por ID

```bash
GET /api/categories/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <token>
```

### 21. Obtener Estadísticas de Categoría

```bash
GET /api/categories/123e4567-e89b-12d3-a456-426614174000/stats
Authorization: Bearer <token>
```

**Query Parameters:**
- `includeInactive` (opcional): Incluir productos inactivos (true/false)
- `period` (opcional): Período de estadísticas (`week`, `month`, `quarter`, `year`)

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Estadísticas de categoría obtenidas exitosamente",
  "data": {
    "category": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Electrónicos",
      "description": "Productos electrónicos y tecnológicos"
    },
    "statistics": {
      "totalProducts": 25,
      "activeProducts": 23,
      "totalInventoryValue": 24999.75,
      "averagePrice": 1086.94,
      "totalStock": 450,
      "lowStockProducts": 3,
      "outOfStockProducts": 1,
      "lastUpdated": "2025-11-27T15:30:00Z"
    }
  }
}
```

### 22. Actualizar Categoría

```bash
PUT /api/categories/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <token>
Content-Type: application/json
```

**Body - Actualizar Nombre:**
```json
{
  "name": "Electrónicos y Tecnología"
}
```

**Body - Actualizar Descripción:**
```json
{
  "description": "Productos electrónicos, gadgets y accesorios tecnológicos"
}
```

**Body - Actualización Completa:**
```json
{
  "name": "Electrónicos y Tecnología",
  "description": "Productos electrónicos, gadgets y accesorios tecnológicos modernos"
}
```

### 23. Eliminar Categoría

```bash
DELETE /api/categories/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <token>
```

> **⚠️ Importante:** Solo se puede eliminar una categoría si **no tiene productos asociados**.

---

## 📊 Códigos de Estado HTTP

| Código | Significado | Descripción |
|--------|------------|-------------|
| **200** | OK | Petición exitosa |
| **201** | Created | Recurso creado exitosamente |
| **400** | Bad Request | Error de validación o datos incorrectos |
| **401** | Unauthorized | Token inválido o no proporcionado |
| **403** | Forbidden | No tienes permisos para esta acción |
| **404** | Not Found | Recurso no encontrado |
| **409** | Conflict | Conflicto (ej: email/barcode duplicado) |
| **413** | Payload Too Large | Archivo demasiado grande |
| **429** | Too Many Requests | Límite de rate limit excedido |
| **500** | Internal Server Error | Error del servidor |

---

## 🔧 Tips de Testing

### 1. Usando cURL

**Ejemplo completo:**
```bash
# Login
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"juan@example.com","password":"Password123!"}'

# Guardar token (Linux/Mac)
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Listar productos
curl -X GET http://localhost:3000/api/products \
  -H "Authorization: Bearer $TOKEN"
```

### 2. Usando Postman

1. **Crear Colección**: Nueva colección "API Inventario"
2. **Configurar Authorization**:
   - Type: Bearer Token
   - Token: `{{token}}` (variable)
3. **Variables**:
   - `baseUrl`: `http://localhost:3000/api`
   - `token`: (se actualiza después del login)

### 3. Usando VS Code REST Client

Crear archivo `test.http`:

```http
### Variables
@baseUrl = http://localhost:3000/api
@token = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

### 1. Login
POST {{baseUrl}}/users/login
Content-Type: application/json

{
  "email": "juan@example.com",
  "password": "Password123!"
}

### 2. Listar Productos
GET {{baseUrl}}/products
Authorization: Bearer {{token}}

### 3. Crear Producto
POST {{baseUrl}}/products
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "iPhone 14 Pro",
  "price": 999.99,
  "stock": 50,
  "barcode": "1234567890123"
}
```

### 4. Orden Recomendado de Testing

1. ✅ Registrar usuario
2. ✅ Login y guardar token
3. ✅ Crear categorías
4. ✅ Crear productos (con y sin categoría)
5. ✅ Listar y filtrar productos
6. ✅ Actualizar stock
7. ✅ Ver estadísticas de categorías
8. ✅ Productos con stock bajo
9. ✅ Actualizar productos/categorías
10. ✅ Eliminar recursos (último paso)

### 5. Variables de Prueba Recomendadas

**Usuarios:**
- Admin: `admin@test.com` / `AdminPass123!`
- Manager: `manager@test.com` / `ManagerPass123!`
- User: `user@test.com` / `UserPass123!`

**Códigos de Barras:**
- `1234567890123` - iPhone 14 Pro
- `9876543210987` - MacBook Pro
- `5555555555555` - AirPods Pro
- `7777777777777` - iPad Air

**Categorías:**
- Electrónicos
- Ropa
- Hogar
- Alimentos
- Juguetes

---

## 📝 Notas Adicionales

### Rate Limiting

La API tiene límites de peticiones por hora:
- **Registro/Login**: 20 requests / 15 minutos
- **Lectura (GET)**: 100 requests / 15 minutos
- **Escritura (POST/PUT/DELETE)**: 50 requests / 15 minutos

Si excedes el límite, recibirás un error **429 Too Many Requests**.

### Cache

Algunos endpoints tienen cache habilitado:
- Lista de productos: 10 minutos
- Lista de categorías: 15 minutos
- Producto individual: 10 minutos
- Estadísticas: 5 minutos

Los cambios (POST/PUT/DELETE) invalidan automáticamente el cache relacionado.

### Documentación Interactiva

Accede a la documentación Scalar en:
```
http://localhost:3000/api-docs
```

O en producción:
```
https://tu-app.railway.app/api-docs
```

---

**✅ ¡Listo para testear!** Si encuentras algún error, verifica:
1. El token JWT está activo (no expirado)
2. Los datos cumplen con las validaciones
3. Tienes los permisos necesarios (rol de usuario)
4. La base de datos está funcionando correctamente
