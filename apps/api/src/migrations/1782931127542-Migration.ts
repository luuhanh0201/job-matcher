import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1782931127542 implements MigrationInterface {
  name = 'Migration1782931127542';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Cột kiểm tra kết nối trên ai_providers
    await queryRunner.query(
      `CREATE TYPE "public"."ai_providers_last_check_status_enum" AS ENUM('UNKNOWN', 'SUCCESS', 'FAILED')`,
    );
    await queryRunner.query(
      `ALTER TABLE "ai_providers" ADD COLUMN "last_checked_at" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "ai_providers" ADD COLUMN "last_check_status" "public"."ai_providers_last_check_status_enum" NOT NULL DEFAULT 'UNKNOWN'`,
    );
    await queryRunner.query(
      `ALTER TABLE "ai_providers" ADD COLUMN "last_check_message" text`,
    );

    // Bảng lưu lịch sử token usage
    await queryRunner.query(
      `CREATE TYPE "public"."ai_usage_logs_feature_enum" AS ENUM('CHAT', 'JOB_MATCHING', 'CV_EXTRACTION', 'CV_ANALYSIS', 'CONNECTION_TEST')`,
    );
    await queryRunner.query(`
      CREATE TABLE "ai_usage_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "provider_id" uuid,
        "vendor" "public"."ai_providers_vendor_enum" NOT NULL,
        "model" character varying NOT NULL,
        "feature" "public"."ai_usage_logs_feature_enum" NOT NULL,
        "input_tokens" integer NOT NULL DEFAULT 0,
        "output_tokens" integer NOT NULL DEFAULT 0,
        "total_tokens" integer NOT NULL DEFAULT 0,
        "success" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_ai_usage_logs_id" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `ALTER TABLE "ai_usage_logs" ADD CONSTRAINT "FK_ai_usage_logs_provider_id" FOREIGN KEY ("provider_id") REFERENCES "ai_providers"("id") ON DELETE SET NULL ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ai_usage_logs_created_at" ON "ai_usage_logs" ("created_at")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ai_usage_logs_created_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ai_usage_logs" DROP CONSTRAINT "FK_ai_usage_logs_provider_id"`,
    );
    await queryRunner.query(`DROP TABLE "ai_usage_logs"`);
    await queryRunner.query(`DROP TYPE "public"."ai_usage_logs_feature_enum"`);

    await queryRunner.query(
      `ALTER TABLE "ai_providers" DROP COLUMN "last_check_message"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ai_providers" DROP COLUMN "last_check_status"`,
    );
    await queryRunner.query(
      `ALTER TABLE "ai_providers" DROP COLUMN "last_checked_at"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."ai_providers_last_check_status_enum"`,
    );
  }
}
