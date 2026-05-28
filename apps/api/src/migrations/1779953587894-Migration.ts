import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1779953587894 implements MigrationInterface {
  name = 'Migration1779953587894';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "companies" ADD "created_by" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD "updated_by" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "updated_by"`);
    await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "created_by"`);
  }
}
