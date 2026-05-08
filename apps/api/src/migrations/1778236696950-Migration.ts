import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1778236696950 implements MigrationInterface {
  name = 'Migration1778236696950';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "cv_documents" ADD "public_id" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "cv_documents" ADD CONSTRAINT "UQ_6e371b3a5e25ed60200123f75fa" UNIQUE ("public_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "cv_documents" DROP CONSTRAINT "UQ_6e371b3a5e25ed60200123f75fa"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cv_documents" DROP COLUMN "public_id"`,
    );
  }
}
