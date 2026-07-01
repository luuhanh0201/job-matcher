import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1781108562666 implements MigrationInterface {
  name = 'Migration1781108562666';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."job_application_status_logs_from_status_enum" AS ENUM('PENDING', 'VIEWED', 'SHORTLISTED', 'REJECTED', 'INTERVIEW', 'HIRED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."job_application_status_logs_to_status_enum" AS ENUM('PENDING', 'VIEWED', 'SHORTLISTED', 'REJECTED', 'INTERVIEW', 'HIRED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "job_application_status_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "application_id" uuid NOT NULL, "from_status" "public"."job_application_status_logs_from_status_enum", "to_status" "public"."job_application_status_logs_to_status_enum" NOT NULL, "content" text NOT NULL, "changed_by_id" uuid, "changed_by_snapshot" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b3f7f3bb72853c35d44b75e20b5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_application_status_logs" ADD CONSTRAINT "FK_f23b6730c900cf34caaae592f1e" FOREIGN KEY ("application_id") REFERENCES "job_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_application_status_logs" ADD CONSTRAINT "FK_f7c5418239810b0b7d0ec44abf1" FOREIGN KEY ("changed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_job_application_status_logs_application_created" ON "job_application_status_logs" ("application_id", "created_at")`,
    );
    await queryRunner.query(`
      INSERT INTO "job_application_status_logs" (
        "application_id",
        "from_status",
        "to_status",
        "content",
        "changed_by_id",
        "changed_by_snapshot",
        "created_at"
      )
      SELECT
        application."id",
        NULL,
        application."status"::text::"public"."job_application_status_logs_to_status_enum",
        CONCAT(
          candidate."full_name",
          ' đã tạo hồ sơ ứng tuyển với trạng thái ',
          CASE application."status"
            WHEN 'PENDING' THEN 'Chờ xem xét'
            WHEN 'VIEWED' THEN 'Đã xem'
            WHEN 'SHORTLISTED' THEN 'Phù hợp'
            WHEN 'REJECTED' THEN 'Từ chối'
            WHEN 'INTERVIEW' THEN 'Phỏng vấn'
            WHEN 'HIRED' THEN 'Đã tuyển'
            ELSE application."status"::text
          END
        ),
        application."candidate_id",
        jsonb_build_object(
          'id', candidate."id",
          'fullName', candidate."full_name",
          'email', candidate."email",
          'role', candidate."role"
        ),
        application."created_at"
      FROM "job_applications" application
      INNER JOIN "users" candidate ON candidate."id" = application."candidate_id"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_job_application_status_logs_application_created"`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_application_status_logs" DROP CONSTRAINT "FK_f7c5418239810b0b7d0ec44abf1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_application_status_logs" DROP CONSTRAINT "FK_f23b6730c900cf34caaae592f1e"`,
    );
    await queryRunner.query(`DROP TABLE "job_application_status_logs"`);
    await queryRunner.query(
      `DROP TYPE "public"."job_application_status_logs_to_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."job_application_status_logs_from_status_enum"`,
    );
  }
}
