import swaggerJsdoc from "swagger-jsdoc";

const swaggerOptions: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "API de Inventario",
      version: "1.0.0",
      description: `
# API de Inventario y Punto de Venta

API REST completa para gestión de inventario, productos, categorías y usuarios.

## Características

-  **Autenticación JWT** (HS256)
-  **Cache Redis** para optimización
-  **Gestión de Productos** y categorías
-  **Sistema de usuarios** con roles
-  **Upload de imágenes** con Multer
-  **Validación** con Zod
-  **Rate limiting** para seguridad

## Autenticación

Para usar los endpoints protegidos:

1. Registra un usuario en \`POST /users/register\`
2. Inicia sesión en \`POST /users/login\`
3. Copia el token JWT recibido
4. Click en el botón "Authorize" 🔒
5. Ingresa: \`Bearer {tu_token}\`

## Tecnologías

- Node.js + Express + TypeScript
- PostgreSQL + TypeORM
- Redis para cache
- JWT con HS256
      `,
      contact: {
        name: "Joel Maldonado",
        email: "joelmaldonado@gmail.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT"
      }
    },
    servers: [
      {
        url: "https://apiinventory-production.up.railway.app/api",
        description: "Servidor de producción (Railway)",
      },
      {
        url: "http://localhost:3000/api",
        description: "Servidor de desarrollo (HTTP)",
      },
      {
        url: "https://localhost:3443/api",
        description: "Servidor de desarrollo (HTTPS)",
      }
    ],
    externalDocs: {
      description: "Repositorio en GitHub",
      url: "https://github.com/SirJowel/Api_Inventory"
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Token JWT para autenticación. Formato: Bearer {token}"
        }
      },
      schemas: {
        // User Schemas
        User: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "ID único del usuario"
            },
            name: {
              type: "string",
              description: "Nombre del usuario",
              example: "Juan Pérez"
            },
            email: {
              type: "string",
              format: "email",
              description: "Email del usuario",
              example: "juan@example.com"
            },
            role: {
              type: "string",
              enum: ["admin", "manager", "user"],
              description: "Rol del usuario",
              example: "user"
            },
            isActive: {
              type: "boolean",
              description: "Estado del usuario",
              example: true
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Fecha de creación"
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Fecha de última actualización"
            }
          }
        },
        CreateUserDto: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            name: {
              type: "string",
              minLength: 2,
              maxLength: 255,
              description: "Nombre del usuario",
              example: "Juan Pérez"
            },
            email: {
              type: "string",
              format: "email",
              maxLength: 255,
              description: "Email del usuario",
              example: "juan@example.com"
            },
            password: {
              type: "string",
              minLength: 8,
              description: "Contraseña del usuario (mínimo 8 caracteres, debe contener mayúscula, minúscula y número)",
              example: "Password123!"
            },
            rol: {
              type: "string",
              enum: ["admin", "manager", "user"],
              description: "Rol del usuario (opcional, por defecto 'user')",
              example: "user"
            }
          }
        },
        UpdateUserDto: {
          type: "object",
          properties: {
            name: {
              type: "string",
              minLength: 2,
              maxLength: 255,
              description: "Nombre del usuario",
              example: "Juan Pérez"
            },
            email: {
              type: "string",
              format: "email",
              maxLength: 255,
              description: "Email del usuario",
              example: "juan@example.com"
            },
            rol: {
              type: "string",
              enum: ["admin", "manager", "user"],
              description: "Rol del usuario",
              example: "user"
            },
            password: {
              type: "string",
              minLength: 8,
              description: "Nueva contraseña (opcional, mínimo 8 caracteres)",
              example: "NewPassword123!"
            }
          }
        },
        LoginDto: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              description: "Email del usuario",
              example: "juan@example.com"
            },
            password: {
              type: "string",
              description: "Contraseña del usuario",
              example: "Password123!"
            }
          }
        },
        // Category Schemas
        Category: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "ID único de la categoría"
            },
            name: {
              type: "string",
              description: "Nombre de la categoría",
              example: "Electrónicos"
            },
            description: {
              type: "string",
              description: "Descripción de la categoría",
              example: "Productos electrónicos y tecnológicos"
            },
            color: {
              type: "string",
              pattern: "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$",
              description: "Color de la categoría en formato hexadecimal",
              example: "#6366f1"
            },
            isActive: {
              type: "boolean",
              description: "Estado de la categoría",
              example: true
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Fecha de creación"
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Fecha de última actualización"
            }
          }
        },
        CreateCategoryDto: {
          type: "object",
          required: ["name"],
          properties: {
            name: {
              type: "string",
              minLength: 1,
              maxLength: 255,
              description: "Nombre de la categoría",
              example: "Electrónicos"
            },
            description: {
              type: "string",
              maxLength: 1000,
              description: "Descripción de la categoría (opcional)",
              example: "Productos electrónicos y tecnológicos"
            },
            color: {
              type: "string",
              pattern: "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$",
              description: "Color de la categoría en formato hexadecimal (opcional, por defecto #6366f1)",
              example: "#6366f1"
            }
          }
        },
        UpdateCategoryDto: {
          type: "object",
          properties: {
            name: {
              type: "string",
              minLength: 1,
              maxLength: 255,
              description: "Nombre de la categoría",
              example: "Electrónicos"
            },
            description: {
              type: "string",
              maxLength: 1000,
              description: "Descripción de la categoría",
              example: "Productos electrónicos y tecnológicos"
            },
            color: {
              type: "string",
              pattern: "^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$",
              description: "Color de la categoría en formato hexadecimal",
              example: "#6366f1"
            }
          }
        },
        // Product Schemas
        Product: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "ID único del producto"
            },
              name: {
                type: "string",
                minLength: 1,
                description: "Nombre del producto",
                example: "iPhone 14 Pro"
              },
            description: {
              type: "string",
              description: "Descripción del producto",
              example: "Smartphone Apple iPhone 14 Pro 128GB"
            },
            price: {
              type: "number",
              format: "float",
              minimum: 0.01,
              maximum: 999999.99,
              description: "Precio de venta del producto (debe ser mayor al costo)",
              example: 999.99
            },
            cost: {
              type: "number",
              format: "float",
              minimum: 0,
              maximum: 999999.99,
              description: "Costo del producto",
              example: 699.99
            },
            stock: {
              type: "integer",
              minimum: 0,
              maximum: 999999,
              description: "Cantidad en stock",
              example: 50
            },
            minStock: {
              type: "integer",
              minimum: 0,
              maximum: 999999,
              description: "Stock mínimo requerido",
              example: 10
            },
            barcode: {
              type: "string",
              maxLength: 50,
              description: "Código de barras del producto (solo mayúsculas y números)",
              example: "1234567890123"
            },
            image: {
              type: "string",
              description: "URL de la imagen del producto",
              example: "uploads/image-1234567890.jpg"
            },
            categoryId: {
              type: "string",
              format: "uuid",
              description: "ID de la categoría del producto"
            },
            category: {
              $ref: "#/components/schemas/Category"
            },
            isActive: {
              type: "boolean",
              description: "Estado del producto",
              example: true
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Fecha de creación"
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Fecha de última actualización"
            }
          }
        },
        CreateProductDto: {
          type: "object",
          required: ["name", "price", "barcode"],
          properties: {
            name: {
              type: "string",
                minLength: 1,
              maxLength: 255,
              description: "Nombre del producto",
              example: "iPhone 14 Pro"
            },
            description: {
              type: "string",
              maxLength: 1000,
              description: "Descripción del producto",
              example: "Smartphone Apple iPhone 14 Pro 128GB"
            },
            price: {
              type: "number",
              format: "float",
              minimum: 0.01,
              maximum: 999999.99,
              description: "Precio de venta del producto (debe ser mayor al costo)",
              example: 999.99
            },
            cost: {
              type: "number",
              format: "float",
              minimum: 0,
              maximum: 999999.99,
              description: "Costo del producto (opcional, por defecto 0)",
              example: 699.99
            },
            stock: {
              type: "integer",
              minimum: 0,
              maximum: 999999,
              description: "Cantidad en stock (opcional, por defecto 0)",
              example: 50
            },
            minStock: {
              type: "integer",
              minimum: 0,
              maximum: 999999,
              description: "Stock mínimo requerido (opcional, por defecto 0)",
              example: 10
            },
            barcode: {
              type: "string",
              maxLength: 50,
              description: "Código de barras del producto",
              example: "1234567890123"
            },
            categoryId: {
              type: "string",
              format: "uuid",
              description: "ID de la categoría del producto (opcional)"
            }
          }
        },
        UpdateProductDto: {
          type: "object",
          properties: {
            name: {
              type: "string",
                minLength: 1,
              maxLength: 255,
              description: "Nombre del producto",
              example: "iPhone 14 Pro"
            },
            description: {
              type: "string",
              maxLength: 1000,
              description: "Descripción del producto",
              example: "Smartphone Apple iPhone 14 Pro 128GB"
            },
            price: {
              type: "number",
              format: "float",
              minimum: 0.01,
              maximum: 999999.99,
              description: "Precio de venta del producto (debe ser mayor al costo)",
              example: 999.99
            },
            cost: {
              type: "number",
              format: "float",
              minimum: 0,
              maximum: 999999.99,
              description: "Costo del producto",
              example: 699.99
            },
            stock: {
              type: "integer",
              minimum: 0,
              maximum: 999999,
              description: "Cantidad en stock",
              example: 50
            },
            minStock: {
              type: "integer",
              minimum: 0,
              maximum: 999999,
              description: "Stock mínimo requerido",
              example: 10
            },
            barcode: {
              type: "string",
              maxLength: 50,
              description: "Código de barras del producto",
              example: "1234567890123"
            },
            categoryId: {
              type: "string",
              format: "uuid",
              description: "ID de la categoría del producto"
            }
          }
        },
        // Response Schemas
        AuthResponse: {
          type: "object",
          properties: {
            token: {
              type: "string",
              description: "Token JWT de autenticación",
              example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            },
            user: {
              $ref: "#/components/schemas/User"
            }
          }
        },
        PaginatedResponse: {
          type: "object",
          properties: {
            data: {
              type: "array",
              items: {}
            },
            totalItems: {
              type: "integer",
              description: "Total de elementos",
              example: 100
            },
            totalPages: {
              type: "integer",
              description: "Total de páginas",
              example: 10
            },
            currentPage: {
              type: "integer",
              description: "Página actual",
              example: 1
            },
            itemsPerPage: {
              type: "integer",
              description: "Elementos por página",
              example: 10
            }
          }
        },
        SuccessResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: true
            },
            message: {
              type: "string",
              example: "Operación exitosa"
            },
            data: {
              type: "object"
            }
          }
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false
            },
            message: {
              type: "string",
              example: "Error en la operación"
            },
            error: {
              type: "string",
              example: "Descripción detallada del error"
            }
          }
        },
        ValidationError: {
          type: "object",
          properties: {
            success: {
              type: "boolean",
              example: false
            },
            message: {
              type: "string",
              example: "Error de validación"
            },
            errors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: {
                    type: "string",
                    example: "email"
                  },
                  message: {
                    type: "string",
                    example: "Debe ser un email válido"
                  }
                }
              }
            }
          }
        }
      },
      responses: {
        Unauthorized: {
          description: "Token de acceso requerido o inválido",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse"
              },
              example: {
                success: false,
                message: "Token de acceso requerido",
                error: "No se proporcionó token de autenticación"
              }
            }
          }
        },
        Forbidden: {
          description: "Acceso denegado - permisos insuficientes",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse"
              },
              example: {
                success: false,
                message: "Acceso denegado",
                error: "No tienes permisos para realizar esta acción"
              }
            }
          }
        },
        NotFound: {
          description: "Recurso no encontrado",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse"
              },
              example: {
                success: false,
                message: "Recurso no encontrado",
                error: "El elemento solicitado no existe"
              }
            }
          }
        },
        ValidationError: {
          description: "Error de validación en los datos enviados",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ValidationError"
              }
            }
          }
        },
        ServerError: {
          description: "Error interno del servidor",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/ErrorResponse"
              },
              example: {
                success: false,
                message: "Error interno del servidor",
                error: "Ha ocurrido un error inesperado"
              }
            }
          }
        }
      }
    },
    tags: [
      {
        name: "Authentication",
        description: "Endpoints para autenticación y gestión de tokens"
      },
      {
        name: "Users",
        description: "Gestión de usuarios del sistema"
      },
      {
        name: "Categories",
        description: "Gestión de categorías de productos"
      },
      {
        name: "Products",
        description: "Gestión de productos del inventario"
      }
    ]
  },
  apis: ["./src/routes/*.ts"], // Escanea los archivos de rutas
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);
