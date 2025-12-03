import { Request, Response } from 'express';
import { ProductService } from '../services/ProductService';

export class ProductController {
    private productService: ProductService;

    constructor() {
        this.productService = new ProductService();
    }

    // Crear producto
    createProduct = async (req: Request, res: Response): Promise<void> => {
        try {
            // Si hay un archivo subido, agregar la ruta de la imagen
            const productData = {
                ...req.body,
                image: req.file ? `/uploads/${req.file.filename}` : undefined
            };
            
            const product = await this.productService.createProduct(productData);
            res.status(201).json({
                success: true,
                message: 'Producto creado exitosamente',
                data: product
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Ocurrió un error',
                data: null
            });
        }
    };

    // Obtener todos los productos
    getAllProducts = async (req: Request, res: Response): Promise<void> => {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 10;

            const result = await this.productService.getAllProducts(page, limit);
            
            res.status(200).json({
                success: true,
                message: 'Productos obtenidos exitosamente',
                data: result.products,
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

    // Obtener producto por ID
    getProductById = async (req: Request, res: Response): Promise<void> => {
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
            const product = await this.productService.getProductById(String(id));
            
            if (!product) {
                res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado',
                    data: null
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Producto obtenido exitosamente',
                data: product
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Ocurrió un error',
                data: null
            });
        }
    };

    // Obtener producto por código de barras
    getProductByBarcode = async (req: Request, res: Response): Promise<void> => {
        try {
            const { barcode } = req.params;
            if (!barcode) {
                res.status(400).json({
                    success: false,
                    message: 'Código de barras requerido',
                    data: null
                });
                return;
            }
            const product = await this.productService.getProductByBarcode(String(barcode));
            
            if (!product) {
                res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado',
                    data: null
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Producto obtenido exitosamente',
                data: product
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Ocurrió un error',
                data: null
            });
        }
    };

    // Actualizar producto
    updateProduct = async (req: Request, res: Response): Promise<void> => {
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
            const product = await this.productService.updateProduct(String(id), req.body);
            
            if (!product) {
                res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado',
                    data: null
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Producto actualizado exitosamente',
                data: product
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Ocurrió un error',
                data: null
            });
        }
    };

    // Eliminar producto
    deleteProduct = async (req: Request, res: Response): Promise<void> => {
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
            const deleted = await this.productService.deleteProduct(String(id));
            
            if (!deleted) {
                res.status(404).json({
                    success: false,
                    message: 'Producto no encontrado',
                    data: null
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Producto eliminado exitosamente',
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

    // Obtener productos con stock bajo
    getLowStockProducts = async (req: Request, res: Response): Promise<void> => {
        try {
            const products = await this.productService.getLowStockProducts();
            
            res.status(200).json({
                success: true,
                message: 'Productos con stock bajo obtenidos exitosamente',
                data: products
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: error instanceof Error ? error.message : 'Ocurrió un error',
                data: null
            });
        }
    };

    // Actualizar stock
    updateStock = async (req: Request, res: Response): Promise<void> => {
        try {
            const { id } = req.params;
            const { stock, operation } = req.body;

            if (!id) {
                res.status(400).json({
                    success: false,
                    message: 'ID requerido',
                    data: null
                });
                return;
            }
            if (stock === undefined || !operation || !['add', 'subtract', 'set'].includes(operation)) {
                res.status(400).json({
                    success: false,
                    message: 'Stock y operación requeridas. Operación debe ser "add", "subtract" o "set"',
                    data: null
                });
                return;
            }

            const product = await this.productService.updateStock(String(id), stock, operation);
            
            res.status(200).json({
                success: true,
                message: 'Stock actualizado exitosamente',
                data: product
            });
        } catch (error) {
            res.status(400).json({
                success: false,
                message: error instanceof Error ? error.message : 'Ocurrió un error',
                data: null
            });
        }
    };
}