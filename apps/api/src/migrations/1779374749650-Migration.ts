import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1779374749650 implements MigrationInterface {
    name = 'Migration1779374749650'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "jobs" DROP CONSTRAINT "FK_2d210533bd8823b36702a26dd43"`);
        await queryRunner.query(`ALTER TABLE "cv_documents" DROP CONSTRAINT "FK_cb0a7d796f724d3d5c45313ed45"`);
        await queryRunner.query(`ALTER TABLE "parsed_cv" DROP CONSTRAINT "FK_890b9f52f1e293efb48fab86ae5"`);
        await queryRunner.query(`ALTER TABLE "match_results" DROP CONSTRAINT "FK_035ab8efc325281d63faf2e38cd"`);
        await queryRunner.query(`ALTER TABLE "match_results" DROP CONSTRAINT "FK_a27ac41f40eec682477efa2fff1"`);
        await queryRunner.query(`ALTER TABLE "user_sessions" DROP CONSTRAINT "FK_e9658e959c490b0a634dfc54783"`);
        await queryRunner.query(`ALTER TABLE "active_log" DROP CONSTRAINT "FK_673234f07b9a71af78e80f53b8b"`);
        await queryRunner.query(`ALTER TABLE "users" ADD "is_verify" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "users" ADD "verify_token" character varying`);
        await queryRunner.query(`ALTER TABLE "jobs" ADD CONSTRAINT "FK_2d210533bd8823b36702a26dd43" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "cv_documents" ADD CONSTRAINT "FK_cb0a7d796f724d3d5c45313ed45" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "parsed_cv" ADD CONSTRAINT "FK_890b9f52f1e293efb48fab86ae5" FOREIGN KEY ("cv_id") REFERENCES "cv_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "match_results" ADD CONSTRAINT "FK_035ab8efc325281d63faf2e38cd" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "match_results" ADD CONSTRAINT "FK_a27ac41f40eec682477efa2fff1" FOREIGN KEY ("parsed_cv_id") REFERENCES "parsed_cv"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_sessions" ADD CONSTRAINT "FK_e9658e959c490b0a634dfc54783" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "active_log" ADD CONSTRAINT "FK_673234f07b9a71af78e80f53b8b" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "active_log" DROP CONSTRAINT "FK_673234f07b9a71af78e80f53b8b"`);
        await queryRunner.query(`ALTER TABLE "user_sessions" DROP CONSTRAINT "FK_e9658e959c490b0a634dfc54783"`);
        await queryRunner.query(`ALTER TABLE "match_results" DROP CONSTRAINT "FK_a27ac41f40eec682477efa2fff1"`);
        await queryRunner.query(`ALTER TABLE "match_results" DROP CONSTRAINT "FK_035ab8efc325281d63faf2e38cd"`);
        await queryRunner.query(`ALTER TABLE "parsed_cv" DROP CONSTRAINT "FK_890b9f52f1e293efb48fab86ae5"`);
        await queryRunner.query(`ALTER TABLE "cv_documents" DROP CONSTRAINT "FK_cb0a7d796f724d3d5c45313ed45"`);
        await queryRunner.query(`ALTER TABLE "jobs" DROP CONSTRAINT "FK_2d210533bd8823b36702a26dd43"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "verify_token"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "is_verify"`);
        await queryRunner.query(`ALTER TABLE "active_log" ADD CONSTRAINT "FK_673234f07b9a71af78e80f53b8b" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_sessions" ADD CONSTRAINT "FK_e9658e959c490b0a634dfc54783" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "match_results" ADD CONSTRAINT "FK_a27ac41f40eec682477efa2fff1" FOREIGN KEY ("parsed_cv_id") REFERENCES "parsed_cv"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "match_results" ADD CONSTRAINT "FK_035ab8efc325281d63faf2e38cd" FOREIGN KEY ("job_id") REFERENCES "jobs"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "parsed_cv" ADD CONSTRAINT "FK_890b9f52f1e293efb48fab86ae5" FOREIGN KEY ("cv_id") REFERENCES "cv_documents"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cv_documents" ADD CONSTRAINT "FK_cb0a7d796f724d3d5c45313ed45" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "jobs" ADD CONSTRAINT "FK_2d210533bd8823b36702a26dd43" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
