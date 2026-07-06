import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1783325884894 implements MigrationInterface {
    name = 'Migration1783325884894'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "saved_jobs" DROP CONSTRAINT "FK_saved_jobs_candidate"`);
        await queryRunner.query(`ALTER TABLE "saved_jobs" DROP CONSTRAINT "FK_saved_jobs_job"`);
        await queryRunner.query(`ALTER TABLE "ai_usage_logs" DROP CONSTRAINT "FK_ai_usage_logs_provider_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_job_posts_status_created_at"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_job_posts_skills_gin"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_ai_provider_single_active"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ai_usage_logs_created_at"`);
        await queryRunner.query(`ALTER TABLE "ai_providers" ALTER COLUMN "max_tokens" SET DEFAULT '10240'`);
        await queryRunner.query(`
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM pg_type t
              JOIN pg_namespace n ON n.oid = t.typnamespace
              WHERE t.typname = 'ai_usage_logs_vendor_enum'
                AND n.nspname = 'public'
            ) THEN
              CREATE TYPE "public"."ai_usage_logs_vendor_enum" AS ENUM('ANTHROPIC', 'OPENAI', 'GEMINI', 'GROQ');
            END IF;
          END
          $$;
        `);
        await queryRunner.query(`ALTER TABLE "ai_usage_logs" ALTER COLUMN "vendor" TYPE "public"."ai_usage_logs_vendor_enum" USING "vendor"::"text"::"public"."ai_usage_logs_vendor_enum"`);
        await queryRunner.query(`ALTER TABLE "saved_jobs" ADD CONSTRAINT "FK_a3550195e29799042b9c8313c83" FOREIGN KEY ("candidate_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "saved_jobs" ADD CONSTRAINT "FK_af5c8a7f3e11e8e646ea0f81a04" FOREIGN KEY ("job_id") REFERENCES "job_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "ai_usage_logs" ADD CONSTRAINT "FK_be4805003d1a98ce1170a135b19" FOREIGN KEY ("provider_id") REFERENCES "ai_providers"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "ai_usage_logs" DROP CONSTRAINT "FK_be4805003d1a98ce1170a135b19"`);
        await queryRunner.query(`ALTER TABLE "saved_jobs" DROP CONSTRAINT "FK_af5c8a7f3e11e8e646ea0f81a04"`);
        await queryRunner.query(`ALTER TABLE "saved_jobs" DROP CONSTRAINT "FK_a3550195e29799042b9c8313c83"`);
        await queryRunner.query(`ALTER TABLE "ai_usage_logs" ALTER COLUMN "vendor" TYPE "public"."ai_providers_vendor_enum" USING "vendor"::"text"::"public"."ai_providers_vendor_enum"`);
        await queryRunner.query(`DROP TYPE "public"."ai_usage_logs_vendor_enum"`);
        await queryRunner.query(`ALTER TABLE "ai_providers" ALTER COLUMN "max_tokens" SET DEFAULT '1024'`);
        await queryRunner.query(`CREATE INDEX "IDX_ai_usage_logs_created_at" ON "ai_usage_logs" ("created_at") `);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_ai_provider_single_active" ON "ai_providers" ("is_active") WHERE (is_active = true)`);
        await queryRunner.query(`CREATE INDEX "IDX_job_posts_skills_gin" ON "job_posts" ("skills") `);
        await queryRunner.query(`CREATE INDEX "IDX_job_posts_status_created_at" ON "job_posts" ("status", "created_at") `);
        await queryRunner.query(`ALTER TABLE "ai_usage_logs" ADD CONSTRAINT "FK_ai_usage_logs_provider_id" FOREIGN KEY ("provider_id") REFERENCES "ai_providers"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "saved_jobs" ADD CONSTRAINT "FK_saved_jobs_job" FOREIGN KEY ("job_id") REFERENCES "job_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "saved_jobs" ADD CONSTRAINT "FK_saved_jobs_candidate" FOREIGN KEY ("candidate_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

}
