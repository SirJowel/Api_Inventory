import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import jwt from 'jsonwebtoken';
import { generateJwtToken } from '../utils/jwtUtils';

export class UserController {
    private userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    // Crear usuario
    createUser = async (req: Request, res: Response): Promise<void> => {
        try {
            const user = await this.userService.createUser(req.body);
            res.status(201).json({
                success: true,
                message: 'Usuario creado exitosamente',
                data: user
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Ocurrió un error',
                data: null
            });
        }
    };

    // Obtener todos los usuarios
    getAllUsers = async (req: Request, res: Response): Promise<void> => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const result = await this.userService.getAllUsers(page, limit);
            
            res.status(200).json({
                success: true,
                message: 'Usuarios obtenidos exitosamente',
                data: result.users,
                pagination: {
                    page,
                    limit,
                    total: result.total,
                    pages: result.pages
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Ocurrió un error',
                data: null
            });
        }
    };

    // Obtener usuario por ID
    getUserById = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: 'ID requerido',
                    data: null
                });
                return;
            }

            const user = await this.userService.getUserById(Number(id));
            
            if (!user) {
                res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado',
                    data: null
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Usuario obtenido exitosamente',
                data: user
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Ocurrió un error',
                data: null
            });
        }
    };

    // Actualizar usuario
    updateUser = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: 'ID requerido',
                    data: null
                });
                return;
            }

            const user = await this.userService.updateUser(Number(id), req.body);
            
            if (!user) {
                res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado',
                    data: null
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Usuario actualizado exitosamente',
                data: user
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Ocurrió un error',
                data: null
            });
        }
    };

    // Eliminar usuario
    deleteUser = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: 'ID requerido',
                    data: null
                });
                return;
            }

            const deleted = await this.userService.deleteUser(Number(id));
            
            if (!deleted) {
                res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado',
                    data: null
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Usuario eliminado exitosamente',
                data: null
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Ocurrió un error',
                data: null
            });
        }
    };

    // Obtener usuarios por rol
    getUsersByRole = async (req: Request, res: Response): Promise<void> => {
        try {
            const { rol } = req.params;
            if (!rol) {
                res.status(400).json({
                    success: false,
                    message: 'Rol requerido',
                    data: null
                });
                return;
            }

            const users = await this.userService.getUsersByRole(String(rol));
            
            res.status(200).json({
                success: true,
                message: `Usuarios con rol ${rol} obtenidos exitosamente`,
                data: users
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Ocurrió un error',
                data: null
            });
        }
    };

    // Login básico (sin JWT por ahora)
    login = async (req: Request, res: Response): Promise<void> => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                res.status(400).json({
                    success: false,
                    message: 'Email y contraseña requeridos',
                    data: null
                });
                return;
            }

            const user = await this.userService.getUserByEmail(email);
            
            if (!user) {
                res.status(401).json({
                    success: false,
                    message: 'Credenciales inválidas',
                    data: null
                });
                return;
            }

            const isValidPassword = await this.userService.verifyPassword(password, user.password_hash);
            
            if (!isValidPassword) {
                res.status(401).json({
                    success: false,
                    message: 'Credenciales inválidas',
                    data: null
                });
                return;
            }
            const token = generateJwtToken({ id: user.id, email: user.email, role: user.rol });

            

            // Retornar usuario sin contraseña
            const { password_hash: _, ...userWithoutPassword } = user;
            
            res.status(200).json({
                success: true,
                message: 'Login exitoso',
                data: userWithoutPassword,
                token
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Ocurrió un error',
                data: null
            });
        }
    };
}