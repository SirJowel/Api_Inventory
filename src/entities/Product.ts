import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    CreateDateColumn, 
    UpdateDateColumn,
    ManyToOne,
    OneToMany,
    JoinColumn,
    Index
} from 'typeorm';
import { Category } from './Category';
//import { SaleDetail } from './SaleDetail';

@Entity('products')
@Index(['barcode'], { unique: true })
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 255 })
    name!: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ type: 'varchar', length: 50, unique: true })
    barcode!: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    cost!: number;

    @Column({ type: 'integer', default: 0 })
    stock!: number;

    @Column({ type: 'integer', default: 0 })
    minStock!: number;

    @Column({ type: 'boolean', default: true })
    isActive!: boolean;

    @Column({ type: 'varchar', length: 255, nullable: true })
    image?: string;

    // Relación con Category
    @Column({ type: 'uuid', nullable: true })
    categoryId?: string;

    @ManyToOne(() => Category, category => category.products, { 
        onDelete: 'SET NULL',
        eager: false 
    })
    @JoinColumn({ name: 'categoryId' })
    category?: Category;

    // Relación con SaleDetail
    //@OneToMany(() => SaleDetail, saleDetail => saleDetail.product)
    //saleDetails: SaleDetail[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt?: Date;

    // Método para verificar si el producto tiene stock bajo
    get isLowStock(): boolean {
        return this.stock <= this.minStock;
    }

    // Método para calcular margen de ganancia
    get profitMargin(): number {
        if (this.cost === 0) return 0;
        return ((this.price - this.cost) / this.cost) * 100;
    }
}