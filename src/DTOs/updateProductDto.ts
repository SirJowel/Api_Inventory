import { 
    IsString, 
    IsOptional, 
    IsNumber, 
    IsBoolean, 
    IsUUID,
    MinLength,
    MaxLength,
    Min,
    IsUrl,
    Matches
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateProductDto {
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
    @IsString({ message: 'El código de barras debe ser un texto' })
    @MinLength(8, { message: 'El código de barras debe tener al menos 8 caracteres' })
    @MaxLength(50, { message: 'El código de barras no puede exceder 50 caracteres' })
    @Matches(/^[0-9A-Za-z-]+$/, { message: 'El código de barras solo puede contener números, letras y guiones' })
    barcode?: string;

    @IsOptional()
    @IsNumber({}, { message: 'El precio debe ser un número' })
    @Min(0, { message: 'El precio no puede ser negativo' })
    @Transform(({ value }) => parseFloat(value))
    price?: number;

    @IsOptional()
    @IsNumber({}, { message: 'El costo debe ser un número' })
    @Min(0, { message: 'El costo no puede ser negativo' })
    @Transform(({ value }) => parseFloat(value))
    cost?: number;

    @IsOptional()
    @IsNumber({}, { message: 'El stock debe ser un número entero' })
    @Min(0, { message: 'El stock no puede ser negativo' })
    @Transform(({ value }) => parseInt(value))
    stock?: number;

    @IsOptional()
    @IsNumber({}, { message: 'El stock mínimo debe ser un número entero' })
    @Min(0, { message: 'El stock mínimo no puede ser negativo' })
    @Transform(({ value }) => parseInt(value))
    minStock?: number;

    @IsOptional()
    @IsBoolean({ message: 'isActive debe ser verdadero o falso' })
    @Transform(({ value }) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        return value;
    })
    isActive?: boolean;

    @IsOptional()
    @IsString({ message: 'La imagen debe ser una URL válida' })
    @IsUrl({}, { message: 'Formato de URL inválido para la imagen' })
    image?: string;

    @IsOptional()
    @IsUUID(4, { message: 'El ID de categoría debe ser un UUID válido' })
    categoryId?: string;
}