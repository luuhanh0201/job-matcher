import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1779871151227 implements MigrationInterface {
  name = 'Migration1779871151227';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "recruiters" ADD "is_verified" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "recruiters" DROP COLUMN "is_verified"`,
    );
  }
}
