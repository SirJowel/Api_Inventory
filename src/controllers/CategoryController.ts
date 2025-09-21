import { Request, Response } from 'express';
import { CategoryService } from '../services/CategoryService';

export class CategoryController {
    private categoryService: CategoryService;

    constructor() {
        this.categoryService = new CategoryService();
    }

    // Crear categoría
    createCategory = async (req: Request, res: Response): Promise<void> => {
        try {
            const category = await this.categoryService.createCategory(req.body);
            res.status(201).json({
                success: true,
                message: 'Categoría creada exitosamente',
                data: category
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Ocurrió un error',
                data: null
            });
        }
    };

    // Obtener todas las categorías
    getAllCategories = async (req: Request, res: Response): Promise<void> => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const result = await this.categoryService.getAllCategories(page, limit);
            
            res.status(200).json({
                success: true,
                message: 'Categorías obtenidas exitosamente',
                data: result.categories,
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

    // Obtener categoría por ID
    getCategoryById = async (req: Request, res: Response): Promise<void> => {
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

            const category = await this.categoryService.getCategoryById(String(id));
            
            if (!category) {
                res.status(404).json({
                    success: false,
                    message: 'Categoría no encontrada',
                    data: null
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Categoría obtenida exitosamente',
                data: category
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Ocurrió un error',
                data: null
            });
        }
    };

    // Actualizar categoría
    updateCategory = async (req: Request, res: Response): Promise<void> => {
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

            const category = await this.categoryService.updateCategory(String(id), req.body);
            
            if (!category) {
                res.status(404).json({
                    success: false,
                    message: 'Categoría no encontrada',
                    data: null
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Categoría actualizada exitosamente',
                data: category
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Ocurrió un error',
                data: null
            });
        }
    };

    // Eliminar categoría
    deleteCategory = async (req: Request, res: Response): Promise<void> => {
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

            const deleted = await this.categoryService.deleteCategory(String(id));
            
            if (!deleted) {
                res.status(404).json({
                    success: false,
                    message: 'Categoría no encontrada',
                    data: null
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Categoría eliminada exitosamente',
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

    // Obtener categorías activas
    getActiveCategories = async (req: Request, res: Response): Promise<void> => {
        try {
            const categories = await this.categoryService.getActiveCategories();
            
            res.status(200).json({
                success: true,
                message: 'Categorías activas obtenidas exitosamente',
                data: categories
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Ocurrió un error',
                data: null
            });
        }
    };

    // Obtener estadísticas de categoría
    getCategoryStats = async (req: Request, res: Response): Promise<void> => {
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

            const stats = await this.categoryService.getCategoryStats(String(id));
            
            if (!stats) {
                res.status(404).json({
                    success: false,
                    message: 'Categoría no encontrada',
                    data: null
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Estadísticas de categoría obtenidas exitosamente',
                data: stats
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