import { Router } from 'express';
import { CategoryController } from '../controllers/CategoryController';
import { 
  validateBody, 
  validateParams, 
  validateQuery,
  createCategorySchema, 
  updateCategorySchema, 
  categorySearchSchema,
  categoryWithStatsSchema,
  uuidParamSchema,
  paginationSchema
} from '../schemas';

const router = Router();
const categoryController = new CategoryController();

/**
 * @swagger
 * /categories:
 *   post:
 *     tags:
 *       - Categories
 *     summary: Crear una nueva categoría
 *     description: Crea una nueva categoría para organizar productos en el inventario.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCategoryDto'
 *           examples:
 *             electronics:
 *               summary: Categoría de electrónicos
 *               value:
 *                 name: "Electrónicos"
 *                 description: "Productos electrónicos y tecnológicos"
 *                 color: "#6366f1"
 *             clothing:
 *               summary: Categoría de ropa
 *               value:
 *                 name: "Ropa"
 *                 description: "Prendas de vestir y accesorios"
 *                 color: "#ec4899"
 *             minimal:
 *               summary: Solo nombre requerido
 *               value:
 *                 name: "Hogar"
 *     responses:
 *       201:
 *         description: Categoría creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Category'
 *             example:
 *               success: true
 *               message: "Categoría creada exitosamente"
 *               data:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 name: "Electrónicos"
 *                 description: "Productos electrónicos y tecnológicos"
 *                 color: "#6366f1"
 *                 isActive: true
 *                 createdAt: "2025-09-21T10:30:00Z"
 *                 updatedAt: "2025-09-21T10:30:00Z"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         description: Nombre de categoría ya existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Nombre de categoría ya existe"
 *               error: "Ya existe una categoría con este nombre"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   get:
 *     tags:
 *       - Categories
 *     summary: Obtener lista de categorías
 *     description: Retorna una lista paginada de todas las categorías con opciones de búsqueda.
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
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Número de elementos por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Término de búsqueda para filtrar categorías por nombre o descripción
 *         example: "electrónicos"
 *       - in: query
 *         name: includeInactive
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Incluir categorías inactivas en los resultados
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, createdAt, updatedAt]
 *           default: name
 *         description: Campo por el cual ordenar
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: asc
 *         description: Orden de clasificación
 *     responses:
 *       200:
 *         description: Lista de categorías obtenida exitosamente
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
 *                                 $ref: '#/components/schemas/Category'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/', 
  validateBody(createCategorySchema),
  categoryController.createCategory
);

router.get('/', 
  validateQuery(paginationSchema.merge(categorySearchSchema)), 
  categoryController.getAllCategories
);

/**
 * @swagger
 * /categories/active:
 *   get:
 *     tags:
 *       - Categories
 *     summary: Obtener categorías activas
 *     description: Retorna una lista paginada de categorías que están marcadas como activas.
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
 *         description: Categorías activas obtenidas exitosamente
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
 *                                 allOf:
 *                                   - $ref: '#/components/schemas/Category'
 *                                   - type: object
 *                                     properties:
 *                                       isActive:
 *                                         type: boolean
 *                                         example: true
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/active', 
  validateQuery(paginationSchema), 
  categoryController.getActiveCategories
);

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     tags:
 *       - Categories
 *     summary: Obtener categoría por ID
 *     description: Retorna la información detallada de una categoría específica.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único de la categoría
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Categoría obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Category'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   put:
 *     tags:
 *       - Categories
 *     summary: Actualizar categoría
 *     description: Actualiza la información de una categoría específica. Todos los campos son opcionales.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único de la categoría
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCategoryDto'
 *           examples:
 *             update_name:
 *               summary: Actualizar nombre
 *               value:
 *                 name: "Electrónicos y Tecnología"
 *             update_description:
 *               summary: Actualizar descripción
 *               value:
 *                 description: "Productos electrónicos, gadgets y accesorios tecnológicos"
 *             update_color:
 *               summary: Actualizar color
 *               value:
 *                 color: "#0ea5e9"
 *             full_update:
 *               summary: Actualización completa
 *               value:
 *                 name: "Electrónicos y Tecnología"
 *                 description: "Productos electrónicos, gadgets y accesorios tecnológicos modernos"
 *                 color: "#6366f1"
 *     responses:
 *       200:
 *         description: Categoría actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Category'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         description: Nombre de categoría ya existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   delete:
 *     tags:
 *       - Categories
 *     summary: Eliminar categoría
 *     description: Elimina una categoría del sistema (soft delete - marca como inactiva). Solo se puede eliminar si no tiene productos asociados.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único de la categoría
 *     responses:
 *       200:
 *         description: Categoría eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Categoría eliminada exitosamente"
 *               data: null
 *       400:
 *         description: Categoría tiene productos asociados
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "No se puede eliminar la categoría"
 *               error: "La categoría tiene productos asociados. Elimine o reasigne los productos primero."
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:id', 
  validateParams(uuidParamSchema), 
  categoryController.getCategoryById
);

/**
 * @swagger
 * /categories/{id}/stats:
 *   get:
 *     tags:
 *       - Categories
 *     summary: Obtener estadísticas de categoría
 *     description: Retorna estadísticas detalladas de una categoría incluyendo número de productos, valor total del inventario, etc.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único de la categoría
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *       - in: query
 *         name: includeInactive
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Incluir productos inactivos en las estadísticas
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, quarter, year]
 *           default: month
 *         description: Período para calcular estadísticas temporales
 *     responses:
 *       200:
 *         description: Estadísticas de categoría obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         category:
 *                           $ref: '#/components/schemas/Category'
 *                         statistics:
 *                           type: object
 *                           properties:
 *                             totalProducts:
 *                               type: integer
 *                               description: Número total de productos en la categoría
 *                               example: 25
 *                             activeProducts:
 *                               type: integer
 *                               description: Número de productos activos
 *                               example: 23
 *                             totalInventoryValue:
 *                               type: number
 *                               format: float
 *                               description: Valor total del inventario en la categoría
 *                               example: 24999.75
 *                             averagePrice:
 *                               type: number
 *                               format: float
 *                               description: Precio promedio de productos
 *                               example: 1086.94
 *                             totalStock:
 *                               type: integer
 *                               description: Stock total en la categoría
 *                               example: 450
 *                             lowStockProducts:
 *                               type: integer
 *                               description: Productos con stock bajo
 *                               example: 3
 *                             outOfStockProducts:
 *                               type: integer
 *                               description: Productos sin stock
 *                               example: 1
 *                             lastUpdated:
 *                               type: string
 *                               format: date-time
 *                               description: Última actualización de estadísticas
 *             example:
 *               success: true
 *               message: "Estadísticas de categoría obtenidas exitosamente"
 *               data:
 *                 category:
 *                   id: "123e4567-e89b-12d3-a456-426614174000"
 *                   name: "Electrónicos"
 *                   description: "Productos electrónicos y tecnológicos"
 *                   isActive: true
 *                 statistics:
 *                   totalProducts: 25
 *                   activeProducts: 23
 *                   totalInventoryValue: 24999.75
 *                   averagePrice: 1086.94
 *                   totalStock: 450
 *                   lowStockProducts: 3
 *                   outOfStockProducts: 1
 *                   lastUpdated: "2025-09-21T15:30:00Z"
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:id/stats', 
  validateParams(uuidParamSchema),
  validateQuery(categoryWithStatsSchema), 
  categoryController.getCategoryStats
);

router.put('/:id', 
  validateParams(uuidParamSchema),
  validateBody(updateCategorySchema),
  categoryController.updateCategory
);

router.delete('/:id', 
  validateParams(uuidParamSchema),
  categoryController.deleteCategory
);

export default router;