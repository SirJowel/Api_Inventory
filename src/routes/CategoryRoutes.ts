import { Router } from 'express';
import { CategoryController } from '../controllers/CategoryController';

const router = Router();
const categoryController = new CategoryController();

// Rutas para categorías
router.post('/', categoryController.createCategory);
router.get('/', categoryController.getAllCategories);
router.get('/active', categoryController.getActiveCategories); // Antes de /:id para evitar conflictos
router.get('/:id', categoryController.getCategoryById);
router.get('/:id/stats', categoryController.getCategoryStats);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

export default router;