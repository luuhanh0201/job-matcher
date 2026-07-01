import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1782918757934 implements MigrationInterface {
    name = 'Migration1782918757934'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."job_application_status_logs_from_status_enum" AS ENUM('PENDING', 'VIEWED', 'SHORTLISTED', 'REJECTED', 'INTERVIEW', 'HIRED')`);
        await queryRunner.query(`CREATE TYPE "public"."job_application_status_logs_to_status_enum" AS ENUM('PENDING', 'VIEWED', 'SHORTLISTED', 'REJECTED', 'INTERVIEW', 'HIRED')`);
        await queryRunner.query(`CREATE TABLE "job_application_status_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "application_id" uuid NOT NULL, "from_status" "public"."job_application_status_logs_from_status_enum", "to_status" "public"."job_application_status_logs_to_status_enum" NOT NULL, "content" text NOT NULL, "changed_by_id" uuid, "changed_by_snapshot" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b3f7f3bb72853c35d44b75e20b5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "job_application_status_logs" ADD CONSTRAINT "FK_f23b6730c900cf34caaae592f1e" FOREIGN KEY ("application_id") REFERENCES "job_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "job_application_status_logs" ADD CONSTRAINT "FK_f7c5418239810b0b7d0ec44abf1" FOREIGN KEY ("changed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "job_application_status_logs" DROP CONSTRAINT "FK_f7c5418239810b0b7d0ec44abf1"`);
        await queryRunner.query(`ALTER TABLE "job_application_status_logs" DROP CONSTRAINT "FK_f23b6730c900cf34caaae592f1e"`);
        await queryRunner.query(`DROP TABLE "job_application_status_logs"`);
        await queryRunner.query(`DROP TYPE "public"."job_application_status_logs_to_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."job_application_status_logs_from_status_enum"`);
    }

}
