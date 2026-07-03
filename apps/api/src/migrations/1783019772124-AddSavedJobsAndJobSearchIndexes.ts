import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSavedJobsAndJobSearchIndexes1783019772124
  implements MigrationInterface
{
  name = 'AddSavedJobsAndJobSearchIndexes1783019772124';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Tìm kiếm không dấu cho tiếng Việt (unaccent(...) ILIKE unaccent(...))
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "unaccent"`);

    await queryRunner.query(
      `CREATE TABLE "saved_jobs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "candidate_id" uuid NOT NULL, "job_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_saved_jobs_candidate_job" UNIQUE ("candidate_id", "job_id"), CONSTRAINT "PK_saved_jobs_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "saved_jobs" ADD CONSTRAINT "FK_saved_jobs_candidate" FOREIGN KEY ("candidate_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "saved_jobs" ADD CONSTRAINT "FK_saved_jobs_job" FOREIGN KEY ("job_id") REFERENCES "job_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );

    await queryRunner.query(
      `CREATE INDEX "IDX_job_posts_status_created_at" ON "job_posts" ("status", "created_at" DESC)`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_job_posts_skills_gin" ON "job_posts" USING GIN ("skills")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_job_posts_province_code" ON "job_posts" ((location ->> 'provinceCode'))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_job_posts_province_code"`);
    await queryRunner.query(`DROP INDEX "IDX_job_posts_skills_gin"`);
    await queryRunner.query(`DROP INDEX "IDX_job_posts_status_created_at"`);
    await queryRunner.query(`DROP TABLE "saved_jobs"`);
    // Không drop extension "unaccent" — có thể đã được dùng ở nơi khác trong DB.
  }
}
