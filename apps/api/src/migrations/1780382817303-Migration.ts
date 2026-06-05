import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1780382817303 implements MigrationInterface {
  name = 'Migration1780382817303';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "match_results" DROP CONSTRAINT "FK_035ab8efc325281d63faf2e38cd"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."job_posts_job_type_enum" AS ENUM('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN', 'FREELANCE')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."job_posts_work_mode_enum" AS ENUM('ONSITE', 'HYBRID', 'REMOTE')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."job_posts_seniority_level_enum" AS ENUM('NO_EXPERIENCE', 'INTERN', 'JUNIOR', 'MID', 'SENIOR', 'LEAD')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."job_posts_salary_type_enum" AS ENUM('NEGOTIABLE', 'RANGE', 'FIXED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."job_posts_status_enum" AS ENUM('DRAFT', 'OPEN', 'CLOSED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."job_posts_currency_enum" AS ENUM('VND', 'USD', 'EUR', 'GBP', 'JPY', 'CNY', 'KRW', 'SGD', 'HKD', 'TWD', 'AUD', 'NZD', 'CAD', 'INR', 'THB', 'MYR', 'IDR', 'PHP', 'CHF', 'SEK', 'NOK', 'DKK', 'AED', 'SAR')`,
    );
    await queryRunner.query(
      `CREATE TABLE "job_posts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "company_id" uuid NOT NULL, "department" character varying NOT NULL, "job_type" "public"."job_posts_job_type_enum" NOT NULL, "work_mode" "public"."job_posts_work_mode_enum" NOT NULL DEFAULT 'ONSITE', "seniority_level" "public"."job_posts_seniority_level_enum" NOT NULL DEFAULT 'NO_EXPERIENCE', "salary_type" "public"."job_posts_salary_type_enum" NOT NULL DEFAULT 'NEGOTIABLE', "salary_min" integer, "salary_max" integer, "description" text NOT NULL, "requirements" text NOT NULL, "responsibilities" text, "benefits" text, "skills" jsonb, "quantity" integer, "location" jsonb, "status" "public"."job_posts_status_enum" NOT NULL DEFAULT 'DRAFT', "currency" "public"."job_posts_currency_enum" NOT NULL DEFAULT 'VND', "published_at" TIMESTAMP, "expired_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "updated_by" jsonb, "created_by" uuid, CONSTRAINT "PK_1ecf5b9e46cd2940d254204a73a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_posts" ADD CONSTRAINT "FK_c2d92b80c8ecec5d94d38fe95e8" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_posts" ADD CONSTRAINT "FK_99666f01665f814e46461e21d3b" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "match_results" ADD CONSTRAINT "FK_035ab8efc325281d63faf2e38cd" FOREIGN KEY ("job_id") REFERENCES "job_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "match_results" DROP CONSTRAINT "FK_035ab8efc325281d63faf2e38cd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_posts" DROP CONSTRAINT "FK_99666f01665f814e46461e21d3b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_posts" DROP CONSTRAINT "FK_c2d92b80c8ecec5d94d38fe95e8"`,
    );
    await queryRunner.query(`DROP TABLE "job_posts"`);
    await queryRunner.query(`DROP TYPE "public"."job_posts_currency_enum"`);
    await queryRunner.query(`DROP TYPE "public"."job_posts_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."job_posts_salary_type_enum"`);
    await queryRunner.query(
      `DROP TYPE "public"."job_posts_seniority_level_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."job_posts_work_mode_enum"`);
    await queryRunner.query(`DROP TYPE "public"."job_posts_job_type_enum"`);
    await queryRunner.query(
      `ALTER TABLE "match_results" ADD CONSTRAINT "FK_035ab8efc325281d63faf2e38cd" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }
}
