import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1779183882257 implements MigrationInterface {
  name = 'Migration1779183882257';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."active_log_actor_type_enum" AS ENUM('CANDIDATE', 'RECRUITER', 'ADMIN')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."active_log_status_enum" AS ENUM('success', 'failed', 'pending')`,
    );
    await queryRunner.query(
      `CREATE TABLE "active_log" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "actor_type" "public"."active_log_actor_type_enum" NOT NULL, "actor_id" uuid NOT NULL, "action" character varying(100) NOT NULL, "status" "public"."active_log_status_enum" NOT NULL DEFAULT 'success', "entity_type" character varying(50), "entity_id" uuid, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_75a2987ba2b19dfe38184130bff" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "google_id" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "facebook_id" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "active_log" ADD CONSTRAINT "FK_673234f07b9a71af78e80f53b8b" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "active_log" DROP CONSTRAINT "FK_673234f07b9a71af78e80f53b8b"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "facebook_id"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "google_id"`);
    await queryRunner.query(`DROP TABLE "active_log"`);
    await queryRunner.query(`DROP TYPE "public"."active_log_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."active_log_actor_type_enum"`);
  }
}
