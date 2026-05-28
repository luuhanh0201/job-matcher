import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1779990278993 implements MigrationInterface {
    name = 'Migration1779990278993'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "created_by"`);
        await queryRunner.query(`ALTER TABLE "companies" ADD "created_by" jsonb`);
        await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "updated_by"`);
        await queryRunner.query(`ALTER TABLE "companies" ADD "updated_by" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "updated_by"`);
        await queryRunner.query(`ALTER TABLE "companies" ADD "updated_by" character varying`);
        await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "created_by"`);
        await queryRunner.query(`ALTER TABLE "companies" ADD "created_by" character varying`);
    }

}
