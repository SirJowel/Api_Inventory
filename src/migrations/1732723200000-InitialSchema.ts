import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1732723200000 implements MigrationInterface {
    name = 'InitialSchema1732723200000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Crear extensión uuid si no existe
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

        // Crear tabla categories
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "categories" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(255) NOT NULL,
                "description" text,
                "color" character varying(7) NOT NULL DEFAULT '#6366f1',
                "isActive" boolean NOT NULL DEFAULT true,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_categories" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_categories_name" UNIQUE ("name")
            )
        `);

        // Crear tabla products
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "products" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(255) NOT NULL,
                "description" text,
                "barcode" character varying(50) NOT NULL,
                "price" numeric(10,2) NOT NULL,
                "cost" numeric(10,2) NOT NULL DEFAULT '0',
                "stock" integer NOT NULL DEFAULT '0',
                "minStock" integer NOT NULL DEFAULT '0',
                "isActive" boolean NOT NULL DEFAULT true,
                "image" character varying(255),
                "categoryId" uuid,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_products" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_products_barcode" UNIQUE ("barcode")
            )
        `);

        // Crear tabla users
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(100) NOT NULL,
                "email" character varying(150) NOT NULL,
                "password" character varying(255) NOT NULL,
                "role" character varying(20) NOT NULL DEFAULT 'user',
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_users" PRIMARY KEY ("id"),
                CONSTRAINT "UQ_users_email" UNIQUE ("email")
            )
        `);

        // Crear relación de products a categories
        await queryRunner.query(`
            ALTER TABLE "products" 
            ADD CONSTRAINT "FK_products_categories" 
            FOREIGN KEY ("categoryId") 
            REFERENCES "categories"("id") 
            ON DELETE SET NULL 
            ON UPDATE NO ACTION
        `);

        // Crear índices para mejorar rendimiento
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_products_categoryId" ON "products" ("categoryId")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_products_name" ON "products" ("name")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_products_barcode" ON "products" ("barcode")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_categories_name" ON "categories" ("name")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_users_email" ON "users" ("email")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar tablas en orden inverso (por las foreign keys)
        await queryRunner.query(`DROP TABLE IF EXISTS "products" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "categories" CASCADE`);
        await queryRunner.query(`DROP TABLE IF EXISTS "users" CASCADE`);
    }
}
