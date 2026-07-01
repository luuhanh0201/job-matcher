import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1782922489144 implements MigrationInterface {
  name = 'Migration1782922489144';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Dọn các bản ghi trùng lặp (job_id, parsed_cv_id) đang tồn tại trước khi thêm ràng buộc unique,
    // chỉ giữ lại bản ghi mới nhất theo matched_at.
    await queryRunner.query(`
      DELETE FROM "match_results" mr
      USING "match_results" mr2
      WHERE mr."job_id" = mr2."job_id"
        AND mr."parsed_cv_id" = mr2."parsed_cv_id"
        AND mr."matched_at" < mr2."matched_at"
    `);
    await queryRunner.query(
      `ALTER TABLE "match_results" ADD CONSTRAINT "UQ_match_result_job_parsed_cv" UNIQUE ("job_id", "parsed_cv_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "match_results" DROP CONSTRAINT "UQ_match_result_job_parsed_cv"`,
    );
  }
}
