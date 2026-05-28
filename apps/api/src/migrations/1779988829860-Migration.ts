import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1779988829860 implements MigrationInterface {
  name = 'Migration1779988829860';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "companies" ADD CONSTRAINT "UQ_3dacbb3eb4f095e29372ff8e131" UNIQUE ("name")`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ALTER COLUMN "deleted_at" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ALTER COLUMN "deleted_at" DROP DEFAULT`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "companies" ALTER COLUMN "deleted_at" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ALTER COLUMN "deleted_at" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" DROP CONSTRAINT "UQ_3dacbb3eb4f095e29372ff8e131"`,
    );
  }
}
