import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1780734691618 implements MigrationInterface {
  name = 'Migration1780734691618';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."interviews_status_enum" AS ENUM('PENDING', 'ACCEPTED', 'DECLINED', 'CANCELLED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "interviews" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "application_id" uuid NOT NULL, "candidate_id" uuid NOT NULL, "recruiter_id" uuid NOT NULL, "scheduled_at" TIMESTAMP NOT NULL, "duration_minutes" integer NOT NULL DEFAULT '60', "meeting_url" character varying, "location" character varying, "note" text, "status" "public"."interviews_status_enum" NOT NULL DEFAULT 'PENDING', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_fd41af1f96d698fa33c2f070f47" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "interviews" ADD CONSTRAINT "FK_77f7078daea9f2b36e9ff761bd1" FOREIGN KEY ("application_id") REFERENCES "job_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "interviews" ADD CONSTRAINT "FK_74f05927fc5dd3d5258bad5f609" FOREIGN KEY ("candidate_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "interviews" ADD CONSTRAINT "FK_978934041f0a0d6e083c7c7e72e" FOREIGN KEY ("recruiter_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "interviews" DROP CONSTRAINT "FK_978934041f0a0d6e083c7c7e72e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "interviews" DROP CONSTRAINT "FK_74f05927fc5dd3d5258bad5f609"`,
    );
    await queryRunner.query(
      `ALTER TABLE "interviews" DROP CONSTRAINT "FK_77f7078daea9f2b36e9ff761bd1"`,
    );
    await queryRunner.query(`DROP TABLE "interviews"`);
    await queryRunner.query(`DROP TYPE "public"."interviews_status_enum"`);
  }
}
