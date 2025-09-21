import { 
    IsString, 
    IsOptional, 
    IsBoolean, 
    MinLength,
    MaxLength,
    Matches
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateCategoryDto {
    @IsOptional()
    @IsString({ message: 'El nombre debe ser un texto' })
    @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
    @MaxLength(255, { message: 'El nombre no puede exceder 255 caracteres' })
    name?: string;

    @IsOptional()
    @IsString({ message: 'La descripción debe ser un texto' })
    @MaxLength(1000, { message: 'La descripción no puede exceder 1000 caracteres' })
    description?: string;

    @IsOptional()
    @IsString({ message: 'El color debe ser un texto' })
    @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'El color debe ser un código hexadecimal válido (ej: #6366f1)' })
    color?: string;

    @IsOptional()
    @IsBoolean({ message: 'isActive debe ser verdadero o falso' })
    @Transform(({ value }) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        return value;
    })
    isActive?: boolean;
}