import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMissingColumns1732723200001 implements MigrationInterface {
    name = 'AddMissingColumns1732723200001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Agregar columnas faltantes en la tabla products
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                              WHERE table_name='products' AND column_name='barcode') THEN
                    ALTER TABLE "products" ADD "barcode" character varying(50);
                END IF;
            END $$;
        `);

        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                              WHERE table_name='products' AND column_name='cost') THEN
                    ALTER TABLE "products" ADD "cost" numeric(10,2) NOT NULL DEFAULT '0';
                END IF;
            END $$;
        `);

        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                              WHERE table_name='products' AND column_name='minStock') THEN
                    ALTER TABLE "products" ADD "minStock" integer NOT NULL DEFAULT '0';
                END IF;
            END $$;
        `);

        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                              WHERE table_name='products' AND column_name='isActive') THEN
                    ALTER TABLE "products" ADD "isActive" boolean NOT NULL DEFAULT true;
                END IF;
            END $$;
        `);

        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                              WHERE table_name='products' AND column_name='image') THEN
                    ALTER TABLE "products" ADD "image" character varying(255);
                END IF;
            END $$;
        `);

        // Agregar restricción UNIQUE a barcode si no existe
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_constraint 
                              WHERE conname = 'UQ_products_barcode') THEN
                    ALTER TABLE "products" ADD CONSTRAINT "UQ_products_barcode" UNIQUE ("barcode");
                END IF;
            END $$;
        `);

        // Crear índice para barcode si no existe
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_products_barcode" ON "products" ("barcode")`);

        // Agregar columnas faltantes en la tabla categories
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                              WHERE table_name='categories' AND column_name='color') THEN
                    ALTER TABLE "categories" ADD "color" character varying(7) NOT NULL DEFAULT '#6366f1';
                END IF;
            END $$;
        `);

        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                              WHERE table_name='categories' AND column_name='isActive') THEN
                    ALTER TABLE "categories" ADD "isActive" boolean NOT NULL DEFAULT true;
                END IF;
            END $$;
        `);

        // Renombrar columnas en la tabla users si existen con nombres antiguos
        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (SELECT 1 FROM information_schema.columns 
                          WHERE table_name='users' AND column_name='nombre') THEN
                    ALTER TABLE "users" RENAME COLUMN "nombre" TO "name";
                END IF;
            END $$;
        `);

        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (SELECT 1 FROM information_schema.columns 
                          WHERE table_name='users' AND column_name='rol') THEN
                    ALTER TABLE "users" RENAME COLUMN "rol" TO "role";
                END IF;
            END $$;
        `);

        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (SELECT 1 FROM information_schema.columns 
                          WHERE table_name='users' AND column_name='password_hash') THEN
                    ALTER TABLE "users" RENAME COLUMN "password_hash" TO "password";
                END IF;
            END $$;
        `);

        await queryRunner.query(`
            DO $$ 
            BEGIN
                IF EXISTS (SELECT 1 FROM information_schema.columns 
                          WHERE table_name='users' AND column_name='fecha_creacion') THEN
                    ALTER TABLE "users" RENAME COLUMN "fecha_creacion" TO "createdAt";
                END IF;
            END $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revertir cambios en products
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN IF EXISTS "image"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN IF EXISTS "isActive"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN IF EXISTS "minStock"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN IF EXISTS "cost"`);
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN IF EXISTS "barcode"`);

        // Revertir cambios en categories
        await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN IF EXISTS "isActive"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP COLUMN IF EXISTS "color"`);

        // Revertir cambios en users
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "createdAt" TO "fecha_creacion"`);
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "password" TO "password_hash"`);
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "role" TO "rol"`);
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "name" TO "nombre"`);
    }
}
