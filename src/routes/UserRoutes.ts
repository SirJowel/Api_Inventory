import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticateToken, authorizeRole, authorizeOwnerOrAdmin } from '../middlewares/auth';

const router = Router();
const userController = new UserController();

// Rutas públicas (sin autenticación)
router.post('/', userController.createUser);
router.post('/login', userController.login);

// Rutas protegidas (requieren autenticación)
router.get('/', authenticateToken, userController.getAllUsers);
router.get('/role/:rol', authenticateToken, authorizeRole(['admin']), userController.getUsersByRole);
router.get('/:id', authenticateToken, authorizeOwnerOrAdmin, userController.getUserById);
router.put('/:id', authenticateToken, authorizeOwnerOrAdmin, userController.updateUser);
router.delete('/:id', authenticateToken, authorizeRole(['admin']), userController.deleteUser);

export default router;