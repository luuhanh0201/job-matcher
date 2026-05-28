import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1779198725158 implements MigrationInterface {
  name = 'Migration1779198725158';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "provider" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "provider"`);
  }
}
