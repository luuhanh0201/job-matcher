import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1777475168643 implements MigrationInterface {
  name = 'Migration1777475168643';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "user_sessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "session_token" character varying NOT NULL, "refresh_token" character varying, "ip_address" character varying, "user_agent" text, "device_name" character varying, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "last_activity_at" TIMESTAMP NOT NULL DEFAULT now(), "expires_at" TIMESTAMP NOT NULL, "revoked_at" TIMESTAMP, "revoke_reason" character varying, CONSTRAINT "UQ_e5eb7a3c7766f941fe16b9edecb" UNIQUE ("session_token"), CONSTRAINT "PK_e93e031a5fed190d4789b6bfd83" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_constraint
          WHERE conname = 'FK_e9658e959c490b0a634dfc54783'
        ) THEN
          ALTER TABLE "user_sessions"
          ADD CONSTRAINT "FK_e9658e959c490b0a634dfc54783"
          FOREIGN KEY ("user_id") REFERENCES "users"("id")
          ON DELETE CASCADE ON UPDATE NO ACTION;
        END IF;
      END $$`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_sessions" DROP CONSTRAINT IF EXISTS "FK_e9658e959c490b0a634dfc54783"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "user_sessions"`);
  }
}
