import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveUseridUnique1778240000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "cv_documents"
      DROP CONSTRAINT "REL_cb0a7d796f724d3d5c45313ed4"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "cv_documents"
      ADD CONSTRAINT "REL_cb0a7d796f724d3d5c45313ed4"
      UNIQUE ("user_id")
    `);
  }
}
