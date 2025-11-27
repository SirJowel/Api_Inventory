import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';
import upload from '../middlewares/multer';
import { cacheMiddleware, invalidateCache } from '../middlewares/cache';
import { rateLimitMiddleware, strictRateLimit, normalRateLimit } from '../middlewares/rateLimit';
import { 
  validateBody, 
  validateParams, 
  validateQuery,
  createProductSchema, 
  updateProductSchema, 
  productSearchSchema,
  updateStockSchema,
  uuidParamSchema,
  paginationSchema,
  barcodeParamSchema,
  fileUploadSchema,
  validateFile
} from '../schemas';



const router = Router();
const productController = new ProductController();

/**
 * @swagger
 * /products:
 *   post:
 *     tags:
 *       - Products
 *     summary: Crear un nuevo producto
 *     description: Crea un nuevo producto en el inventario. Permite subir una imagen opcional del producto.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - stock
 *               - barcode
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 255
 *                 description: Nombre del producto
 *                 example: "iPhone 14 Pro"
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Descripción del producto
 *                 example: "Smartphone Apple iPhone 14 Pro 128GB"
 *               price:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *                 description: Precio del producto
 *                 example: 999.99
 *               stock:
 *                 type: integer
 *                 minimum: 0
 *                 description: Cantidad en stock
 *                 example: 50
 *               minStock:
 *                 type: integer
 *                 minimum: 0
 *                 description: Stock mínimo requerido
 *                 example: 10
 *               barcode:
 *                 type: string
 *                 description: Código de barras único del producto
 *                 example: "1234567890123"
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *                 description: ID de la categoría del producto
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Imagen del producto (JPEG, PNG, GIF, WEBP - máx 5MB)
 *     responses:
 *       201:
 *         description: Producto creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Product'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         description: Código de barras ya existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Código de barras ya existe"
 *               error: "Ya existe un producto con este código de barras"
 *       413:
 *         description: Archivo demasiado grande
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Archivo demasiado grande"
 *               error: "La imagen no puede superar los 5MB"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   get:
 *     tags:
 *       - Products
 *     summary: Obtener lista de productos
 *     description: Retorna una lista paginada de productos con opciones de búsqueda y filtrado.
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
 *         description: Término de búsqueda para filtrar productos por nombre o descripción
 *         example: "iPhone"
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filtrar productos por categoría
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Precio mínimo para filtrar
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Precio máximo para filtrar
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [name, price, stock, createdAt]
 *           default: createdAt
 *         description: Campo por el cual ordenar
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Orden de clasificación
 *     responses:
 *       200:
 *         description: Lista de productos obtenida exitosamente
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
 *                                 $ref: '#/components/schemas/Product'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/', 
  rateLimitMiddleware(50, 3600), // 50 productos por hora
  upload.single('image'), 
  validateFile(fileUploadSchema),
  validateBody(createProductSchema),
  invalidateCache('cache:product*'), // Invalidar cache de productos
  productController.createProduct
);

router.get('/', 
  normalRateLimit,
  cacheMiddleware(600, 'cache:products'), // Cache de 10 minutos para lista de productos
  validateQuery(paginationSchema.merge(productSearchSchema)), 
  productController.getAllProducts
);

/**
 * @swagger
 * /products/low-stock:
 *   get:
 *     tags:
 *       - Products
 *     summary: Obtener productos con stock bajo
 *     description: Retorna una lista de productos que tienen stock igual o menor al stock mínimo configurado.
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
 *         description: Productos con stock bajo obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         allOf:
 *                           - $ref: '#/components/schemas/Product'
 *                           - type: object
 *                             properties:
 *                               lowStockAlert:
 *                                 type: boolean
 *                                 example: true
 *                                 description: Indica que el producto tiene stock bajo
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/low-stock', 
  normalRateLimit,
  cacheMiddleware(300, 'cache:products:low-stock'), // Cache de 5 minutos para stock bajo
  validateQuery(paginationSchema), 
  productController.getLowStockProducts
);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     tags:
 *       - Products
 *     summary: Obtener producto por ID
 *     description: Retorna la información detallada de un producto específico incluyendo su categoría.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único del producto
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Producto obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Product'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   put:
 *     tags:
 *       - Products
 *     summary: Actualizar producto
 *     description: Actualiza la información de un producto específico. Todos los campos son opcionales.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único del producto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProductDto'
 *           examples:
 *             update_price:
 *               summary: Actualizar precio
 *               value:
 *                 price: 1099.99
 *             update_stock:
 *               summary: Actualizar stock
 *               value:
 *                 stock: 25
 *                 minStock: 5
 *             full_update:
 *               summary: Actualización completa
 *               value:
 *                 name: "iPhone 14 Pro Max"
 *                 description: "Smartphone Apple iPhone 14 Pro Max 256GB"
 *                 price: 1199.99
 *                 stock: 30
 *                 minStock: 5
 *     responses:
 *       200:
 *         description: Producto actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Product'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       409:
 *         description: Código de barras ya existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 *   delete:
 *     tags:
 *       - Products
 *     summary: Eliminar producto
 *     description: Elimina un producto del inventario (soft delete - marca como inactivo).
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único del producto
 *     responses:
 *       200:
 *         description: Producto eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               message: "Producto eliminado exitosamente"
 *               data: null
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:id', 
  normalRateLimit,
  cacheMiddleware(600, 'cache:product'), // Cache de 10 minutos por producto
  validateParams(uuidParamSchema), 
  productController.getProductById
);

/**
 * @swagger
 * /products/barcode/{barcode}:
 *   get:
 *     tags:
 *       - Products
 *     summary: Buscar producto por código de barras
 *     description: Retorna la información de un producto utilizando su código de barras único.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: barcode
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 1
 *           maxLength: 50
 *         description: Código de barras del producto
 *         example: "1234567890123"
 *     responses:
 *       200:
 *         description: Producto encontrado por código de barras
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Product'
 *       404:
 *         description: Producto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Producto no encontrado"
 *               error: "No existe un producto con este código de barras"
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/barcode/:barcode', 
  normalRateLimit,
  cacheMiddleware(300, 'cache:product:barcode'), // Cache de 5 minutos para búsqueda por código
  validateParams(barcodeParamSchema), 
  productController.getProductByBarcode
);

router.put('/:id', 
  strictRateLimit, // Rate limit estricto para modificaciones
  validateParams(uuidParamSchema),
  validateBody(updateProductSchema),
  invalidateCache('cache:product*'), // Invalidar cache de productos
  productController.updateProduct
);

router.delete('/:id', 
  strictRateLimit, // Rate limit estricto para eliminaciones
  validateParams(uuidParamSchema),
  invalidateCache('cache:product*'), // Invalidar cache de productos
  productController.deleteProduct
);

/**
 * @swagger
 * /products/{id}/stock:
 *   patch:
 *     tags:
 *       - Products
 *     summary: Actualizar stock del producto
 *     description: Permite aumentar o disminuir el stock de un producto específico. Útil para movimientos de inventario.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID único del producto
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quantity
 *               - operation
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 1
 *                 description: Cantidad a modificar en el stock
 *                 example: 10
 *               operation:
 *                 type: string
 *                 enum: [add, subtract]
 *                 description: Tipo de operación a realizar
 *                 example: "add"
 *           examples:
 *             add_stock:
 *               summary: Aumentar stock (entrada de mercancía)
 *               value:
 *                 quantity: 50
 *                 operation: "add"
 *             subtract_stock:
 *               summary: Disminuir stock (venta o merma)
 *               value:
 *                 quantity: 5
 *                 operation: "subtract"
 *     responses:
 *       200:
 *         description: Stock actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       allOf:
 *                         - $ref: '#/components/schemas/Product'
 *                         - type: object
 *                           properties:
 *                             previousStock:
 *                               type: integer
 *                               description: Stock anterior a la modificación
 *                               example: 45
 *                             newStock:
 *                               type: integer
 *                               description: Nuevo stock después de la modificación
 *                               example: 55
 *             example:
 *               success: true
 *               message: "Stock actualizado exitosamente"
 *               data:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 name: "iPhone 14 Pro"
 *                 stock: 55
 *                 previousStock: 45
 *                 newStock: 55
 *       400:
 *         description: Error de validación o stock insuficiente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               insufficient_stock:
 *                 summary: Stock insuficiente
 *                 value:
 *                   success: false
 *                   message: "Stock insuficiente"
 *                   error: "No hay suficiente stock para realizar esta operación"
 *               validation_error:
 *                 summary: Error de validación
 *                 value:
 *                   success: false
 *                   message: "Error de validación"
 *                   error: "La cantidad debe ser mayor a 0"
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.patch('/:id/stock', 
  rateLimitMiddleware(200, 3600), // 200 actualizaciones de stock por hora
  validateParams(uuidParamSchema),
  validateBody(updateStockSchema),
  invalidateCache('cache:product*'), // Invalidar cache por cambio de stock
  productController.updateStock
);



export default router;