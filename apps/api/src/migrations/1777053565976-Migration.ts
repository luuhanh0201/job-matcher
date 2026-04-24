import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1777053565976 implements MigrationInterface {
    name = 'Migration1777053565976'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."cv_documents_file_type_enum" AS ENUM('pdf', 'docx', 'txt')`);
        await queryRunner.query(`CREATE TYPE "public"."cv_documents_upload_status_enum" AS ENUM('PENDING', 'COMPLETED', 'FAILED')`);
        await queryRunner.query(`CREATE TABLE "cv_documents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "file_name" character varying NOT NULL, "file_type" "public"."cv_documents_file_type_enum" NOT NULL, "file_url" character varying NOT NULL, "upload_status" "public"."cv_documents_upload_status_enum" NOT NULL DEFAULT 'PENDING', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, CONSTRAINT "REL_cb0a7d796f724d3d5c45313ed4" UNIQUE ("user_id"), CONSTRAINT "PK_21adace014b91999c44d43fa988" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "cv_documents" ADD CONSTRAINT "FK_cb0a7d796f724d3d5c45313ed45" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cv_documents" DROP CONSTRAINT "FK_cb0a7d796f724d3d5c45313ed45"`);
        await queryRunner.query(`DROP TABLE "cv_documents"`);
        await queryRunner.query(`DROP TYPE "public"."cv_documents_upload_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."cv_documents_file_type_enum"`);
    }

}
