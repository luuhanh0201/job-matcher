import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1780732517903 implements MigrationInterface {
  name = 'Migration1780732517903';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "candidate_profiles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "current_title" character varying, "total_experience_years" character varying, "summary" text, "skills" jsonb, "education" jsonb, "work_experience" jsonb, "certifications" jsonb, "languages" jsonb, "portfolio_url" character varying, "linkedin_url" character varying, "github_url" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_5a3673f11918bcea56f48549603" UNIQUE ("user_id"), CONSTRAINT "REL_5a3673f11918bcea56f4854960" UNIQUE ("user_id"), CONSTRAINT "PK_8e8cf5b54118601673585218cc4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "candidate_profiles" ADD CONSTRAINT "FK_5a3673f11918bcea56f48549603" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "candidate_profiles" DROP CONSTRAINT "FK_5a3673f11918bcea56f48549603"`,
    );
    await queryRunner.query(`DROP TABLE "candidate_profiles"`);
  }
}
