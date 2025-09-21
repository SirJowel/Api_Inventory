import { Repository } from "typeorm";
import { AppDataSource } from "../config/db";
import { Category } from "../entities/Category";
import { CreateCategoryDto } from "../DTOs/createCategory";
import { UpdateCategoryDto } from "../DTOs/updateCategory";
import { Product } from "../entities/Product";

export class CategoryService {
    private categoryRepository: Repository<Category>;
    private productRepository: Repository<Product>;
    
    constructor() {
        this.categoryRepository = AppDataSource.getRepository(Category);
        this.productRepository = AppDataSource.getRepository(Product);
    }

    // Crear una nueva categoría
    async createCategory(categoryData: CreateCategoryDto): Promise<Category> {
        try {
            // Verificar si el nombre ya existe
            const existingCategory = await this.categoryRepository.findOne({
                where: { name: categoryData.name }
            });

            if (existingCategory) {
                throw new Error('El nombre de la categoría ya existe');
            }

            const category = this.categoryRepository.create(categoryData);
            return await this.categoryRepository.save(category);
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error al crear categoría: ${error.message}`);
            }
            throw new Error('Error al crear categoría');
        }
    }

    // Obtener todas las categorías con paginación
    async getAllCategories(page: number = 1, limit: number = 10): Promise<{
        categories: Category[],
        total: number,
        pages: number
    }> {
        try {
            const [categories, total] = await this.categoryRepository.findAndCount({
                relations: ['products'],
                skip: (page - 1) * limit,
                take: limit,
                order: { createdAt: 'DESC' }
            });

            return {
                categories,
                total,
                pages: Math.ceil(total / limit)
            };
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error al obtener categorías: ${error.message}`);
            }
            throw new Error('Error al obtener categorías');
        }
    }

    // Obtener categoría por ID
    async getCategoryById(id: string): Promise<Category | null> {
        try {
            return await this.categoryRepository.findOne({
                where: { id },
                relations: ['products']
            });
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error al obtener categoría: ${error.message}`);
            }
            throw new Error('Error al obtener categoría');
        }
    }

    // Actualizar categoría
    async updateCategory(id: string, updateData: UpdateCategoryDto): Promise<Category | null> {
        try {
            const category = await this.categoryRepository.findOne({ where: { id } });
            if (!category) {
                throw new Error('Categoría no encontrada');
            }

            // Verificar nombre único si se está actualizando
            if (updateData.name && updateData.name !== category.name) {
                const existingCategory = await this.categoryRepository.findOne({
                    where: { name: updateData.name }
                });
                if (existingCategory) {
                    throw new Error('El nombre de la categoría ya existe');
                }
            }

            await this.categoryRepository.update(id, updateData);
            return await this.getCategoryById(id);
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error al actualizar categoría: ${error.message}`);
            }
            throw new Error('Error al actualizar categoría');
        }
    }

    // Eliminar categoría (soft delete)
    async deleteCategory(id: string): Promise<boolean> {
        try {
            // Verificar si hay productos asociados
            const productsCount = await this.productRepository.count({
                where: { category: { id } }
            });

            if (productsCount > 0) {
                throw new Error('No se puede eliminar la categoría porque tiene productos asociados');
            }

            const result = await this.categoryRepository.update(id, { isActive: false });
            return (typeof result.affected === 'number' && result.affected > 0);
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error al eliminar categoría: ${error.message}`);
            }
            throw new Error('Error al eliminar categoría');
        }
    }

    // Obtener categorías activas
    async getActiveCategories(): Promise<Category[]> {
        try {
            return await this.categoryRepository.find({
                where: { isActive: true },
                order: { name: 'ASC' }
            });
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error al obtener categorías activas: ${error.message}`);
            }
            throw new Error('Error al obtener categorías activas');
        }
    }

    // Obtener estadísticas de categorías
    async getCategoryStats(id: string): Promise<{
        category: Category,
        totalProducts: number,
        activeProducts: number,
        inactiveProducts: number
    } | null> {
        try {
            const category = await this.categoryRepository.findOne({
                where: { id },
                relations: ['products']
            });

            if (!category) {
                return null;
            }

            const totalProducts = category.products.length;
            const activeProducts = category.products.filter(p => p.isActive).length;
            const inactiveProducts = totalProducts - activeProducts;

            return {
                category,
                totalProducts,
                activeProducts,
                inactiveProducts
            };
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error al obtener estadísticas de categoría: ${error.message}`);
            }
            throw new Error('Error al obtener estadísticas de categoría');
        }
    }
}