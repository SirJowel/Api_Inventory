import { 
    IsString, 
    IsEmail, 
    IsOptional, 
    MinLength,
    MaxLength,
    IsIn
} from 'class-validator';

export class UpdateUserDto {
    @IsOptional()
    @IsString({ message: 'El nombre debe ser un texto' })
    @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
    @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
    name?: string;

    @IsOptional()
    @IsEmail({}, { message: 'Debe ser un email válido' })
    @MaxLength(150, { message: 'El email no puede exceder 150 caracteres' })
    email?: string;

    @IsOptional()
    @IsString({ message: 'El rol debe ser un texto' })
    @IsIn(['admin', 'manager', 'user'], { message: 'El rol debe ser admin, manager o user' })
    rol?: string;

    @IsOptional()
    @IsString({ message: 'La contraseña debe ser un texto' })
    @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
    password?: string;
}