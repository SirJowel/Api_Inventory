import { Repository } from 'typeorm';
import { AppDataSource } from '../config/db';
import { User } from '../entities/User';
import { CreateUserDto } from '../DTOs/createUser';
import { UpdateUserDto } from '../DTOs/updateUser';
import bcrypt from 'bcrypt';

export class UserService {
    private userRepository: Repository<User>;

    constructor() {
        this.userRepository = AppDataSource.getRepository(User);
    }

    // Crear un nuevo usuario
    async createUser(userData: CreateUserDto): Promise<Omit<User, 'password'>> {
        try {
            // Verificar si el email ya existe
            const existingUser = await this.userRepository.findOne({
                where: { email: userData.email }
            });

            if (existingUser) {
                throw new Error('El email ya está registrado');
            }

            // Hash de la contraseña
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

            const user = this.userRepository.create({
                name: userData.name,
                email: userData.email,
                role: userData.rol || 'user',
                password: hashedPassword
            });

            const savedUser = await this.userRepository.save(user);
            
            // Retornar usuario sin el hash de la contraseña
            const { password: _, ...userWithoutPassword } = savedUser;
            return userWithoutPassword;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error al crear usuario: ${error.message}`);
            }
            throw new Error('Error al crear usuario');
        }
    }

    // Obtener todos los usuarios con paginación
    async getAllUsers(page: number = 1, limit: number = 10): Promise<{
        users: Omit<User, 'password'>[],
        total: number,
        pages: number
    }> {
        try {
            const [users, total] = await this.userRepository.findAndCount({
                select: ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt'],
                skip: (page - 1) * limit,
                take: limit,
                order: { createdAt: 'DESC' }
            });

            return {
                users,
                total,
                pages: Math.ceil(total / limit)
            };
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error al obtener usuarios: ${error.message}`);
            }
            throw new Error('Error al obtener usuarios');
        }
    }

    // Obtener usuario por ID
    async getUserById(id: string): Promise<Omit<User, 'password'> | null> {
        try {
            const user = await this.userRepository.findOne({
                where: { id },
                select: ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt']
            });

            return user;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error al obtener usuario: ${error.message}`);
            }
            throw new Error('Error al obtener usuario');
        }
    }

    // Obtener usuario por email (para login)
    async getUserByEmail(email: string): Promise<User | null> {
        try {
            return await this.userRepository.findOne({
                where: { email }
            });
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error al buscar usuario por email: ${error.message}`);
            }
            throw new Error('Error al buscar usuario por email');
        }
    }

    // Actualizar usuario
    async updateUser(id: string, updateData: UpdateUserDto): Promise<Omit<User, 'password'> | null> {
        try {
            const user = await this.userRepository.findOne({ where: { id } });
            if (!user) {
                throw new Error('Usuario no encontrado');
            }

            // Verificar email único si se está actualizando
            if (updateData.email && updateData.email !== user.email) {
                const existingUser = await this.userRepository.findOne({
                    where: { email: updateData.email }
                });
                if (existingUser) {
                    throw new Error('El email ya está registrado');
                }
            }

            // Si se actualiza la contraseña, hashearla
            const updateDataToSave: any = {};
            if (updateData.name) updateDataToSave.name = updateData.name;
            if (updateData.email) updateDataToSave.email = updateData.email;
            if (updateData.rol) updateDataToSave.role = updateData.rol;
            
            if (updateData.password) {
                const saltRounds = 10;
                updateDataToSave.password = await bcrypt.hash(updateData.password, saltRounds);
            }

            await this.userRepository.update(id, updateDataToSave);
            return await this.getUserById(id);
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error al actualizar usuario: ${error.message}`);
            }
            throw new Error('Error al actualizar usuario');
        }
    }

    // Eliminar usuario
    async deleteUser(id: string): Promise<boolean> {
        try {
            const result = await this.userRepository.delete(id);
            return (typeof result.affected === 'number' && result.affected > 0);
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error al eliminar usuario: ${error.message}`);
            }
            throw new Error('Error al eliminar usuario');
        }
    }

    // Verificar contraseña
    async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
        try {
            return await bcrypt.compare(plainPassword, hashedPassword);
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error al verificar contraseña: ${error.message}`);
            }
            throw new Error('Error al verificar contraseña');
        }
    }

    // Obtener usuarios por rol
    async getUsersByRole(rol: string): Promise<Omit<User, 'password'>[]> {
        try {
            return await this.userRepository.find({
                where: { role: rol },
                select: ['id', 'name', 'email', 'role', 'createdAt', 'updatedAt'],
                order: { name: 'ASC' }
            });
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Error al obtener usuarios por rol: ${error.message}`);
            }
            throw new Error('Error al obtener usuarios por rol');
        }
    }

    
}