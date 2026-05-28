import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1779903210815 implements MigrationInterface {
  name = 'Migration1779903210815';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "companies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "short_name" character varying, "logo_url" character varying, "company_size" character varying NOT NULL DEFAULT '1-10', "email" character varying, "phone" character varying, "tax_code" character varying, "company_type" character varying, "website" character varying, "location" jsonb, "linkedin_url" character varying, "facebook_url" character varying, "description" text, "is_verified" boolean NOT NULL DEFAULT false, "status" character varying NOT NULL DEFAULT 'ACTIVE', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d4bc3e82a314fa9e29f652c2c22" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "companies"`);
  }
}
