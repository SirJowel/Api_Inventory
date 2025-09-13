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
    @MaxLength(255, { message: 'El nombre no puede exceder 255 caracteres' })
    nombre?: string;

    @IsOptional()
    @IsEmail({}, { message: 'Debe ser un email válido' })
    @MaxLength(255, { message: 'El email no puede exceder 255 caracteres' })
    email?: string;

    @IsOptional()
    @IsString({ message: 'El rol debe ser un texto' })
    @IsIn(['admin', 'editor', 'user'], { message: 'El rol debe ser admin, editor o user' })
    rol?: string;

    @IsOptional()
    @IsString({ message: 'La contraseña debe ser un texto' })
    @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
    password?: string;
}