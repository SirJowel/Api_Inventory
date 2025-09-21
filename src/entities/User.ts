import { 
    Entity, 
    PrimaryGeneratedColumn, 
    Column, 
    CreateDateColumn, 
    UpdateDateColumn
} from 'typeorm';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 255 })
    nombre!: string;

    @Column({ type: 'varchar', length: 255, unique: true })
    email!: string;

    @Column({ type: 'varchar', length: 50, default: 'user' })
    rol!: string;

    @Column({ type: 'varchar', length: 255 })
    password_hash!: string;

    @CreateDateColumn()
    fecha_creacion!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}