import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCvProcessingError1778259700000 implements MigrationInterface {
  name = 'AddCvProcessingError1778259700000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "cv_documents" ADD "processing_error" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "cv_documents" DROP COLUMN "processing_error"`,
    );
  }
}
