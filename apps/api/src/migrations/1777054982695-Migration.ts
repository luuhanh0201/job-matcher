import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1777054982695 implements MigrationInterface {
  name = 'Migration1777054982695';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "parsed_cv" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "candidate_name" character varying, "email" character varying, "phone" character varying, "total_experience_years" character varying, "current_title" character varying, "skills" text, "education" text, "work_experience" text, "certifications" text, "languages" text, "parsed_at" TIMESTAMP NOT NULL DEFAULT now(), "cv_id" uuid, CONSTRAINT "REL_890b9f52f1e293efb48fab86ae" UNIQUE ("cv_id"), CONSTRAINT "PK_49a09dde70e55c17bc7e9ab1c49" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "match_results" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "overall_score" double precision NOT NULL, "skill_score" double precision NOT NULL, "experience_score" double precision NOT NULL, "education_score" double precision NOT NULL, "title_score" double precision NOT NULL, "matched_skills" text NOT NULL, "missing_skills" text NOT NULL, "explanation" text NOT NULL, "matched_at" TIMESTAMP NOT NULL DEFAULT now(), "job_id" uuid, "parsed_cv_id" uuid, CONSTRAINT "PK_788799fb3b8324d976620b485f2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "parsed_cv" ADD CONSTRAINT "FK_890b9f52f1e293efb48fab86ae5" FOREIGN KEY ("cv_id") REFERENCES "cv_documents"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "match_results" ADD CONSTRAINT "FK_035ab8efc325281d63faf2e38cd" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "match_results" ADD CONSTRAINT "FK_a27ac41f40eec682477efa2fff1" FOREIGN KEY ("parsed_cv_id") REFERENCES "parsed_cv"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "match_results" DROP CONSTRAINT "FK_a27ac41f40eec682477efa2fff1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "match_results" DROP CONSTRAINT "FK_035ab8efc325281d63faf2e38cd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "parsed_cv" DROP CONSTRAINT "FK_890b9f52f1e293efb48fab86ae5"`,
    );
    await queryRunner.query(`DROP TABLE "match_results"`);
    await queryRunner.query(`DROP TABLE "parsed_cv"`);
  }
}
