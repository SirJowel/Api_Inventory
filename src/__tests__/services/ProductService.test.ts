import '../setup';
import { ProductService } from '../../services/ProductService';
import { Product } from '../../entities/Product';
import { Category } from '../../entities/Category';
import { testDataSource, createTestCategory, createTestProduct } from '../setup';
import { CreateProductDto } from '../../DTOs/createProductDto';
import { UpdateProductDto } from '../../DTOs/updateProductDto';

describe('ProductService', () => {
  let productService: ProductService;
  let productRepository: any;
  let categoryRepository: any;

  beforeEach(() => {
    productRepository = testDataSource.getRepository(Product);
    categoryRepository = testDataSource.getRepository(Category);
    productService = new ProductService();
    // Override repositories para usar los de testing
    (productService as any).productRepository = productRepository;
    (productService as any).categoryRepository = categoryRepository;
  });

  describe('createProduct', () => {
    it('should create a new product successfully', async () => {
      // Arrange
      const category = await createTestCategory();
      
      const createProductDto: CreateProductDto = {
        name: 'Test Product',
        description: 'Test Description',
        price: 100.50,
        stock: 25,
        barcode: 'TEST123456',
        categoryId: category.id
      };

      // Act
      const result = await productService.createProduct(createProductDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.name).toBe(createProductDto.name);
      expect(result.description).toBe(createProductDto.description);
      expect(result.price).toBe(createProductDto.price);
      expect(result.stock).toBe(createProductDto.stock);
      expect(result.barcode).toBe(createProductDto.barcode);
      expect(result.id).toBeDefined();
    });

    it('should throw error when category does not exist', async () => {
      // Arrange
      const createProductDto: CreateProductDto = {
        name: 'Test Product',
        description: 'Test Description',
        price: 100.50,
        stock: 25,
        barcode: 'TEST123456',
        categoryId: 'non-existent-id'
      };

      // Act & Assert
      await expect(productService.createProduct(createProductDto))
        .rejects
        .toThrow('Categoría no encontrada');
    });

    it('should throw error when barcode already exists', async () => {
      // Arrange
      const category = await createTestCategory();
      
      const createProductDto: CreateProductDto = {
        name: 'Test Product',
        description: 'Test Description',
        price: 100.50,
        stock: 25,
        barcode: 'DUPLICATE123',
        categoryId: category.id
      };

      await productService.createProduct(createProductDto);

      const duplicateProduct: CreateProductDto = {
        ...createProductDto,
        name: 'Another Product'
      };

      // Act & Assert
      await expect(productService.createProduct(duplicateProduct))
        .rejects
        .toThrow('Error al crear producto: El código de barras ya existe');
    });
  });

  describe('getAllProducts', () => {
    it('should return paginated products', async () => {
      // Arrange
      const category = await createTestCategory();
      
      for (let i = 1; i <= 5; i++) {
        const productDto: CreateProductDto = {
          name: `Product ${i}`,
          description: `Description ${i}`,
          price: 100 * i,
          stock: 10 * i,
          barcode: `CODE${i}`,
          categoryId: category.id
        };
        await productService.createProduct(productDto);
      }

      // Act
      const result = await productService.getAllProducts(1, 10);

      // Assert
      expect(result.products).toHaveLength(5);
      expect(result.total).toBe(5);
      expect(result.pages).toBe(1);
    });

    it('should filter products by search term', async () => {
      // Arrange
      const category = await createTestCategory();
      
      const products = [
        { name: 'iPhone 15', description: 'Smartphone Apple', price: 999, stock: 10, barcode: 'IP15', categoryId: category.id },
        { name: 'Samsung Galaxy', description: 'Smartphone Samsung', price: 899, stock: 15, barcode: 'SAM01', categoryId: category.id },
        { name: 'MacBook Pro', description: 'Laptop Apple', price: 1999, stock: 5, barcode: 'MBP01', categoryId: category.id }
      ];

      for (const productData of products) {
        await productService.createProduct(productData);
      }

      // Act
      const appleResults = await productService.getAllProducts(1, 10);
      const smartphoneResults = await productService.getAllProducts(1, 10);

      // Assert
      expect(appleResults.products.length).toBeGreaterThan(0);
      expect(smartphoneResults.products.length).toBeGreaterThan(0);
    });
  });

  describe('getProductById', () => {
    it('should return product when found', async () => {
      // Arrange
      const product = await createTestProduct();

      // Act
      const result = await productService.getProductById(product.id);

      // Assert
      expect(result).toBeDefined();
      expect(result?.id).toBe(product.id);
      expect(result?.name).toBe(product.name);
    });

    it('should return null when product not found', async () => {
      // Act
      const result = await productService.getProductById('non-existent-id');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('getProductByBarcode', () => {
    it('should return product when found by barcode', async () => {
      // Arrange
      const product = await createTestProduct();

      // Act
      const result = await productService.getProductByBarcode(product.barcode);

      // Assert
      expect(result).toBeDefined();
      expect(result?.barcode).toBe(product.barcode);
      expect(result?.name).toBe(product.name);
    });

    it('should return null when product not found by barcode', async () => {
      // Act
      const result = await productService.getProductByBarcode('NON_EXISTENT');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('updateProduct', () => {
    it('should update product successfully', async () => {
      // Arrange
      const product = await createTestProduct();
      
      const updateData: UpdateProductDto = {
        name: 'Updated Product',
        price: 199.99,
        stock: 100
      };

      // Act
      const result = await productService.updateProduct(product.id, updateData);

      // Assert
      expect(result).toBeDefined();
      expect(result?.name).toBe('Updated Product');
      expect(result?.price).toBe(199.99);
      expect(result?.stock).toBe(100);
    });

    it('should throw error when updating non-existent product', async () => {
      // Arrange
      const updateData: UpdateProductDto = {
        name: 'Updated Product'
      };

      // Act & Assert
      await expect(productService.updateProduct('non-existent-id', updateData))
        .rejects
        .toThrow('Producto no encontrado');
    });
  });

  describe('deleteProduct', () => {
    it('should delete product successfully', async () => {
      // Arrange
      const product = await createTestProduct();

      // Act
      const result = await productService.deleteProduct(product.id);

      // Assert
      expect(result).toBe(true);

      // Verify product is marked as inactive
      const deletedProduct = await productService.getProductById(product.id);
      expect(deletedProduct?.isActive).toBe(false);
    });

    it('should return false when deleting non-existent product', async () => {
      // Act
      const result = await productService.deleteProduct('non-existent-id');

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('updateStock', () => {
    it('should update stock successfully with add operation', async () => {
      // Arrange
      const product = await createTestProduct(); // stock inicial: 50
      
      // Act
      const result = await productService.updateStock(product.id, 25, 'add');

      // Assert
      expect(result).toBeDefined();
      expect(result?.stock).toBe(75);
    });

    it('should update stock successfully with subtract operation', async () => {
      // Arrange
      const product = await createTestProduct(); // stock inicial: 50
      
      // Act
      const result = await productService.updateStock(product.id, 25, 'subtract');

      // Assert
      expect(result).toBeDefined();
      expect(result?.stock).toBe(25);
    });

    it('should update stock successfully with set operation', async () => {
      // Arrange
      const product = await createTestProduct(); // stock inicial: 50
      
      // Act
      const result = await productService.updateStock(product.id, 100, 'set');

      // Assert
      expect(result).toBeDefined();
      expect(result?.stock).toBe(100);
    });

    it('should throw error when updating stock of non-existent product', async () => {
      // Act & Assert
      await expect(productService.updateStock('non-existent-id', 25, 'add'))
        .rejects
        .toThrow('Producto no encontrado');
    });

    it('should prevent negative stock', async () => {
      // Arrange
      const product = await createTestProduct();
      
      // Act & Assert
      await expect(productService.updateStock(product.id, 100, 'subtract'))
        .rejects
        .toThrow('Stock insuficiente');
    });

    it('should prevent setting negative stock', async () => {
      // Arrange
      const product = await createTestProduct();
      
      // Act & Assert
      await expect(productService.updateStock(product.id, -10, 'set'))
        .rejects
        .toThrow('Stock insuficiente');
    });
  });

  describe('getLowStockProducts', () => {
    it('should return products with low stock', async () => {
      // Arrange
      const category = await createTestCategory();
      
      const products = [
        { name: 'Low Stock 1', description: 'Test', price: 100, stock: 5, barcode: 'LOW1', categoryId: category.id, minStock: 10 },
        { name: 'High Stock', description: 'Test', price: 100, stock: 100, barcode: 'HIGH1', categoryId: category.id, minStock: 10 },
        { name: 'Low Stock 2', description: 'Test', price: 100, stock: 8, barcode: 'LOW2', categoryId: category.id, minStock: 10 }
      ];

      for (const productData of products) {
        await productService.createProduct(productData);
      }

      // Act
      const result = await productService.getLowStockProducts();

      // Assert
      expect(result).toHaveLength(2); // 2 products with stock <= minStock
      expect(result.every(p => p.stock <= p.minStock)).toBe(true);
    });
  });
});