import { Router } from 'express';
import { UserController } from '../controllers/UserController';

const router = Router();
const userController = new UserController();

// Rutas para usuarios
router.post('/', userController.createUser);
router.post('/login', userController.login);
router.get('/', userController.getAllUsers);
router.get('/role/:rol', userController.getUsersByRole); // Antes de /:id para evitar conflictos
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

export default router;