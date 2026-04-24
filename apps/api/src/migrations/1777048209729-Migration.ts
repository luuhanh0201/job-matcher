import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1777048209729 implements MigrationInterface {
    name = 'Migration1777048209729'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password_hash" character varying NOT NULL, "full_name" character varying NOT NULL, "phone" character varying NOT NULL, "avatar" character varying, "role" "public"."users_role_enum" NOT NULL DEFAULT 'CANDIDATE', "status" "public"."users_status_enum" NOT NULL DEFAULT 'ACTIVE', "last_login_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "jobs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "department" character varying NOT NULL, "employment_type" "public"."jobs_employment_type_enum" NOT NULL, "seniority_level" "public"."jobs_seniority_level_enum" NOT NULL, "company" character varying NOT NULL, "location" character varying NOT NULL, "salary_min" integer NOT NULL, "salary_max" integer NOT NULL, "description" text NOT NULL, "requirements" text NOT NULL, "status" "public"."jobs_status_enum" NOT NULL DEFAULT 'DRAFT', "published_at" TIMESTAMP NOT NULL DEFAULT now(), "expired_at" TIMESTAMP NOT NULL DEFAULT now(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "created_by" uuid, CONSTRAINT "REL_2d210533bd8823b36702a26dd4" UNIQUE ("created_by"), CONSTRAINT "PK_cf0a6c42b72fcc7f7c237def345" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "jobs" ADD CONSTRAINT "FK_2d210533bd8823b36702a26dd43" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "jobs" DROP CONSTRAINT "FK_2d210533bd8823b36702a26dd43"`);
        await queryRunner.query(`DROP TABLE "jobs"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
