import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';
import upload from '../middlewares/multer';

const router = Router();
const productController = new ProductController();

// Rutas para productos
// Rutas para productos
router.post('/', upload.single('image'), productController.createProduct);
router.get('/', productController.getAllProducts);
router.get('/low-stock', productController.getLowStockProducts); // Antes de /:id para evitar conflictos
router.get('/:id', productController.getProductById);
router.get('/barcode/:barcode', productController.getProductByBarcode);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);
router.patch('/:id/stock', productController.updateStock);

export default router;