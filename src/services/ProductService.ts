import { Repository } from 'typeorm';
import { AppDataSource } from '../config/db';
import { Product } from '../entities/Product';
import { Category } from '../entities/Category';
import { CreateProductDto } from '../DTOs/createProductDto';
import { UpdateProductDto } from '../DTOs/updateProductDto';

export class ProductService {
    private productRepository: Repository<Product>;
    private categoryRepository: Repository<Category>;

    constructor() {
        this.productRepository = AppDataSource.getRepository(Product);
        this.categoryRepository = AppDataSource.getRepository(Category);
    }

    // Crear un nuevo producto
    async createProduct(productData: CreateProductDto): Promise<Product> {
        try {
            // Verificar si la categoría existe si se proporciona
            if (productData.categoryId) {
                
                const category = await this.categoryRepository.findOne({
                    where: { id: productData.categoryId }
                });
                if (!category) {
                    throw new Error('Categoría no encontrada');
                }
            }

            // Verificar si el código de barras ya existe
            const existingProduct = await this.productRepository.findOne({
                where: { barcode: productData.barcode }
            });

            if (existingProduct) {
                throw new Error('El código de barras ya existe');
            }

            const product = this.productRepository.create(productData);
            return await this.productRepository.save(product);
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error al crear producto: ${error.message}`);
            }
            throw new Error('Error al crear producto');
        }
    }

    // Obtener todos los productos con paginación
    async getAllProducts(page: number = 1, limit: number = 10): Promise<{
        products: Product[],
        total: number,
        pages: number
    }> {
        try {
            const [products, total] = await this.productRepository.findAndCount({
                relations: ['category'],
                skip: (page - 1) * limit,
                take: limit,
                order: { createdAt: 'DESC' }
            });

            return {
                products,
                total,
                pages: Math.ceil(total / limit)
            };
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error al obtener productos: ${error.message}`);
            }
            throw new Error('Error al obtener productos');
        }
    }

    // Obtener producto por ID
    async getProductById(id: string): Promise<Product | null> {
        try {
            return await this.productRepository.findOne({
                where: { id },
                relations: ['category']
            });
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error al obtener producto: ${error.message}`);
            }
            throw new Error('Error al obtener producto');
        }
    }

    // Buscar productos por código de barras
    async getProductByBarcode(barcode: string): Promise<Product | null> {
        try {
            return await this.productRepository.findOne({
                where: { barcode },
                relations: ['category']
            });
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error al buscar producto por código de barras: ${error.message}`);
            }
            throw new Error('Error al buscar producto por código de barras');
        }
    }

    // Actualizar producto
    async updateProduct(id: string, updateData: UpdateProductDto): Promise<Product | null> {
        try {
            const product = await this.productRepository.findOne({ where: { id } });
            if (!product) {
                throw new Error('Producto no encontrado');
            }

            // Verificar categoría si se está actualizando
            if (updateData.categoryId) {
                const category = await this.categoryRepository.findOne({
                    where: { id: updateData.categoryId }
                });
                if (!category) {
                    throw new Error('Categoría no encontrada');
                }
            }

            // Verificar código de barras único si se está actualizando
            if (updateData.barcode && updateData.barcode !== product.barcode) {
                const existingProduct = await this.productRepository.findOne({
                    where: { barcode: updateData.barcode }
                });
                if (existingProduct) {
                    throw new Error('El código de barras ya existe');
                }
            }

            await this.productRepository.update(id, updateData);
            return await this.getProductById(id);
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error al actualizar producto: ${error.message}`);
            }
            throw new Error('Error al actualizar producto');
        }
    }

    // Eliminar producto (soft delete)
    async deleteProduct(id: string): Promise<boolean> {
        try {
            const result = await this.productRepository.update(id, { isActive: false });
            return (typeof result.affected === 'number' && result.affected > 0);
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error al eliminar producto: ${error.message}`);
            }
            throw new Error('Error al eliminar producto');
        }
    }

    // Obtener productos con stock bajo
    async getLowStockProducts(): Promise<Product[]> {
        try {
            return await this.productRepository
                .createQueryBuilder('product')
                .where('product.stock <= product.minStock')
                .andWhere('product.isActive = true')
                .leftJoinAndSelect('product.category', 'category')
                .orderBy('product.stock', 'ASC')
                .getMany();
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error al obtener productos con stock bajo: ${error.message}`);
            }
            throw new Error('Error al obtener productos con stock bajo');
        }
    }

    // Actualizar stock del producto
    async updateStock(id: string, quantity: number, operation: 'add' | 'subtract'): Promise<Product | null> {
        try {
            const product = await this.productRepository.findOne({ where: { id } });
            if (!product) {
                throw new Error('Producto no encontrado');
            }

            const newStock = operation === 'add' 
                ? product.stock + quantity 
                : product.stock - quantity;

            if (newStock < 0) {
                throw new Error('Stock insuficiente');
            }

            product.stock = newStock;
            return await this.productRepository.save(product);
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error al actualizar stock: ${error.message}`);
            }
            throw new Error('Error al actualizar stock');
        }
    }
}