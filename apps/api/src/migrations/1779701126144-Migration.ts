import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1779701126144 implements MigrationInterface {
    name = 'Migration1779701126144'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "recruiters" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "contact_phone" character varying, "contact_email" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "REL_0c851bd72ee5568e8793794624" UNIQUE ("user_id"), CONSTRAINT "PK_1999e5a8e68fa6c525eed22c970" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "recruiters" ADD CONSTRAINT "FK_0c851bd72ee5568e8793794624b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "recruiters" DROP CONSTRAINT "FK_0c851bd72ee5568e8793794624b"`);
        await queryRunner.query(`DROP TABLE "recruiters"`);
    }

}
