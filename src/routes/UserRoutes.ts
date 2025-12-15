import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticateToken, authorizeRole, authorizeOwnerOrAdmin } from '../middlewares/auth';
import { 
  validateBody, 
  validateParams, 
  validateQuery,
  createUserSchema, 
  updateUserSchema, 
  loginSchema,
  idParamSchema,
  paginationSchema
} from '../schemas';

const router = Router();
const userController = new UserController();

/**
 * @swagger
 * /users:
 *   post:
 *     tags:
 *       - Users
 *     summary: Crear un nuevo usuario
 *     description: Registra un nuevo usuario en el sistema. No requiere autenticación.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserDto'
 *           examples:
 *             user_example:
 *               summary: Ejemplo de usuario
 *               value:
 *                 name: "Juan Pérez"
 *                 email: "juan@example.com"
 *                 password: "Password123!"
 *                 rol: "user"
 *             admin_example:
 *               summary: Ejemplo de administrador
 *               value:
 *                 name: "Admin User"
 *                 email: "admin@example.com"
 *                 password: "AdminPass123!"
 *                 rol: "admin"
 *     responses:
 *       201:
 *         description: Usuario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *             example:
 *               success: true
 *               message: "Usuario creado exitosamente"
 *               data:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 name: "Juan Pérez"
 *                 email: "juan@example.com"
 *                 role: "user"
 *                 isActive: true
 *                 createdAt: "2025-09-21T10:30:00Z"
 *                 updatedAt: "2025-09-21T10:30:00Z"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         description: Email ya registrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Email ya registrado"
 *               error: "Ya existe un usuario con este email"
 *       429:
 *         description: Demasiadas solicitudes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Demasiadas solicitudes"
 *               error: "Rate limit excedido, intenta más tarde"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/', 
  validateBody(createUserSchema),
  userController.createUser
);

/**
 * @swagger
 * /users/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Iniciar sesión
 *     description: Autentica un usuario y devuelve un token JWT para acceder a endpoints protegidos.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginDto'
 *           example:
 *             email: "juan@example.com"
 *             password: "Password123!"
 *     responses:
 *       200:
 *         description: Login exitoso
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               success: true
 *               message: "Login exitoso"
 *               data:
 *                 token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 user:
 *                   id: "123e4567-e89b-12d3-a456-426614174000"
 *                   name: "Juan Pérez"
 *                   email: "juan@example.com"
 *                   role: "user"
 *                   isActive: true
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: Credenciales inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Credenciales inválidas"
 *               error: "Email o contraseña incorrectos"
 *       429:
 *         description: Demasiados intentos de login
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Demasiados intentos"
 *               error: "Límite de intentos de login excedido"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/login', 
  validateBody(loginSchema), 
  userController.login
);

/**
 * @swagger
 * /users:
 *   get:
 *     tags:
 *       - Users
 *     summary: Obtener lista de usuarios
 *     description: Retorna una lista paginada de todos los usuarios del sistema. Requiere autenticación.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Número de elementos por página
 *         example: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Término de búsqueda para filtrar usuarios por nombre o email
 *         example: "juan"
 *     responses:
 *       200:
 *         description: Lista de usuarios obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       allOf:
 *                         - $ref: '#/components/schemas/PaginatedResponse'
 *                         - type: object
 *                           properties:
 *                             data:
 *                               type: array
 *                               items:
 *                                 $ref: '#/components/schemas/User'
 *             example:
 *               success: true
 *               message: "Usuarios obtenidos exitosamente"
 *               data:
 *                 data:
 *                   - id: "123e4567-e89b-12d3-a456-426614174000"
 *                     name: "Juan Pérez"
 *                     email: "juan@example.com"
 *                     role: "user"
 *                     isActive: true
 *                     createdAt: "2025-09-21T10:30:00Z"
 *                     updatedAt: "2025-09-21T10:30:00Z"
 *                 totalItems: 1
 *                 totalPages: 1
 *                 currentPage: 1
 *                 itemsPerPage: 10
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/', 
  authenticateToken,
  validateQuery(paginationSchema),
  userController.getAllUsers
);

/**
 * @swagger
 * /users/role/{rol}:
 *   get:
 *     tags:
 *       - Users
 *     summary: Obtener usuarios por rol
 *     description: Retorna una lista paginada de usuarios filtrados por rol. Solo accesible por administradores.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: rol
 *         required: true
 *         schema:
 *           type: string
 *           enum: [admin, manager, user]
 *         description: Rol a filtrar
 *         example: "user"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Número de elementos por página
 *     responses:
 *       200:
 *         description: Usuarios filtrados por rol obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       allOf:
 *                         - $ref: '#/components/schemas/PaginatedResponse'
 *                         - type: object
 *                           properties:
 *                             data:
 *                               type: array
 *                               items:
 *                                 $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/role/:rol', 
  authenticateToken, 
  authorizeRole(['admin']),
  validateQuery(paginationSchema),
  userController.getUsersByRole
);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     tags:
 *       - Users
 *     summary: Obtener usuario por ID
 *     description: Retorna la información detallada de un usuario específico. Solo el propio usuario o un administrador pueden acceder.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único del usuario
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Usuario obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *             example:
 *               success: true
 *               message: "Usuario obtenido exitosamente"
 *               data:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 name: "Juan Pérez"
 *                 email: "juan@example.com"
 *                 role: "user"
 *                 isActive: true
 *                 createdAt: "2025-09-21T10:30:00Z"
 *                 updatedAt: "2025-09-21T10:30:00Z"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   put:
 *     tags:
 *       - Users
 *     summary: Actualizar usuario
 *     description: Actualiza la información de un usuario específico. Solo el propio usuario o un administrador pueden hacer modificaciones.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único del usuario
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserDto'
 *           examples:
 *             update_name:
 *               summary: Actualizar solo nombre
 *               value:
 *                 name: "Juan Carlos Pérez"
 *             update_email:
 *               summary: Actualizar email
 *               value:
 *                 email: "juan.carlos@example.com"
 *             update_role:
 *               summary: Actualizar rol (solo admin)
 *               value:
 *                 rol: "manager"
 *             full_update:
 *               summary: Actualización completa
 *               value:
 *                 name: "Juan Carlos Pérez"
 *                 email: "juan.carlos@example.com"
 *                 rol: "manager"
 *     responses:
 *       200:
 *         description: Usuario actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/User'
 *             example:
 *               success: true
 *               message: "Usuario actualizado exitosamente"
 *               data:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 name: "Juan Carlos Pérez"
 *                 email: "juan.carlos@example.com"
 *                 role: "manager"
 *                 isActive: true
 *                 createdAt: "2025-09-21T10:30:00Z"
 *                 updatedAt: "2025-09-21T12:45:00Z"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         description: Email ya está en uso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Email ya está en uso"
 *               error: "Ya existe otro usuario con este email"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   delete:
 *     tags:
 *       - Users
 *     summary: Eliminar usuario
 *     description: Elimina un usuario del sistema (soft delete). Solo administradores pueden realizar esta acción.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único del usuario
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Usuario eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Usuario eliminado exitosamente"
 *               data: null
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:id', 
  authenticateToken, 
  authorizeOwnerOrAdmin,
  validateParams(idParamSchema),
  userController.getUserById
);

router.put('/:id', 
  authenticateToken, 
  authorizeOwnerOrAdmin,
  validateParams(idParamSchema),
  validateBody(updateUserSchema),
  userController.updateUser
);

router.delete('/:id', 
  authenticateToken, 
  authorizeRole(['admin']),
  validateParams(idParamSchema),
  userController.deleteUser
);

export default router;