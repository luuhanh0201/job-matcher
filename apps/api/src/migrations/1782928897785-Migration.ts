import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1782928897785 implements MigrationInterface {
  name = 'Migration1782928897785';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."ai_providers_vendor_enum" AS ENUM('ANTHROPIC', 'OPENAI', 'GEMINI')`,
    );
    await queryRunner.query(`
      CREATE TABLE "ai_providers" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "vendor" "public"."ai_providers_vendor_enum" NOT NULL,
        "model" character varying NOT NULL,
        "api_key_cipher_text" text NOT NULL,
        "api_key_iv" character varying NOT NULL,
        "api_key_auth_tag" character varying NOT NULL,
        "api_key_masked" character varying NOT NULL,
        "max_tokens" integer NOT NULL DEFAULT 1024,
        "is_active" boolean NOT NULL DEFAULT false,
        "created_by" jsonb,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_ai_providers_id" PRIMARY KEY ("id")
      )
    `);
    // Đảm bảo ở tầng DB chỉ 1 provider active tại một thời điểm.
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_ai_provider_single_active" ON "ai_providers" ("is_active") WHERE "is_active" = true`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."UQ_ai_provider_single_active"`,
    );
    await queryRunner.query(`DROP TABLE "ai_providers"`);
    await queryRunner.query(`DROP TYPE "public"."ai_providers_vendor_enum"`);
  }
}
