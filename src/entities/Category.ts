import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    CreateDateColumn, 
    UpdateDateColumn,
    OneToMany
} from 'typeorm';
import { Product } from './Product';

@Entity('categories')
export class Category {

    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'varchar', length: 255, unique: true })
    name!: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ type: 'varchar', length: 7, default: '#6366f1' }) // Color hex
    color!: string;

    @Column({ type: 'boolean', default: true })
    isActive!: boolean;

    // Relación con Products
    @OneToMany(() => Product, product => product.category)
    products!: Product[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

   
}