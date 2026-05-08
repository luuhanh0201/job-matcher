import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1778240876139 implements MigrationInterface {
    name = 'Migration1778240876139'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cv_documents" DROP CONSTRAINT "FK_cb0a7d796f724d3d5c45313ed45"`);
        await queryRunner.query(`ALTER TABLE "cv_documents" ALTER COLUMN "user_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "cv_documents" ALTER COLUMN "user_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "cv_documents" ADD CONSTRAINT "FK_cb0a7d796f724d3d5c45313ed45" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cv_documents" DROP CONSTRAINT "FK_cb0a7d796f724d3d5c45313ed45"`);
        await queryRunner.query(`ALTER TABLE "cv_documents" ALTER COLUMN "user_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "cv_documents" ALTER COLUMN "user_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "cv_documents" ADD CONSTRAINT "FK_cb0a7d796f724d3d5c45313ed45" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
