import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1782417111114 implements MigrationInterface {
  name = 'Migration1782417111114';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('CANDIDATE', 'RECRUITER', 'ADMIN')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_status_enum" AS ENUM('ACTIVE', 'INACTIVE', 'BANNED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password_hash" character varying, "full_name" character varying NOT NULL, "phone" character varying, "avatar" character varying, "role" "public"."users_role_enum" NOT NULL DEFAULT 'CANDIDATE', "status" "public"."users_status_enum" NOT NULL DEFAULT 'ACTIVE', "last_login_at" TIMESTAMP, "is_verify" boolean NOT NULL DEFAULT false, "verify_token" character varying, "google_id" character varying, "facebook_id" character varying, "provider" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "recruiters" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "contact_phone" character varying, "contact_email" character varying, "is_verified" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "REL_0c851bd72ee5568e8793794624" UNIQUE ("user_id"), CONSTRAINT "PK_1999e5a8e68fa6c525eed22c970" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "companies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "short_name" character varying, "logo_url" character varying, "company_size" character varying NOT NULL DEFAULT '1-10', "email" character varying, "phone" character varying, "tax_code" character varying, "company_type" character varying, "website" character varying, "location" jsonb, "linkedin_url" character varying, "facebook_url" character varying, "description" text, "is_verified" boolean NOT NULL DEFAULT false, "status" character varying NOT NULL DEFAULT 'ACTIVE', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "created_by" jsonb, "updated_by" jsonb, CONSTRAINT "UQ_3dacbb3eb4f095e29372ff8e131" UNIQUE ("name"), CONSTRAINT "PK_d4bc3e82a314fa9e29f652c2c22" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."job_posts_job_type_enum" AS ENUM('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERN', 'FREELANCE')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."job_posts_work_mode_enum" AS ENUM('ONSITE', 'HYBRID', 'REMOTE')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."job_posts_seniority_level_enum" AS ENUM('NO_EXPERIENCE', 'INTERN', 'JUNIOR', 'MID', 'SENIOR', 'LEAD')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."job_posts_salary_type_enum" AS ENUM('NEGOTIABLE', 'RANGE', 'FIXED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."job_posts_status_enum" AS ENUM('DRAFT', 'OPEN', 'CLOSED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."job_posts_currency_enum" AS ENUM('VND', 'USD', 'EUR', 'GBP', 'JPY', 'CNY', 'KRW', 'SGD', 'HKD', 'TWD', 'AUD', 'NZD', 'CAD', 'INR', 'THB', 'MYR', 'IDR', 'PHP', 'CHF', 'SEK', 'NOK', 'DKK', 'AED', 'SAR')`,
    );
    await queryRunner.query(
      `CREATE TABLE "job_posts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "company_id" uuid NOT NULL, "department" character varying NOT NULL, "job_type" "public"."job_posts_job_type_enum" NOT NULL, "work_mode" "public"."job_posts_work_mode_enum" NOT NULL DEFAULT 'ONSITE', "seniority_level" "public"."job_posts_seniority_level_enum" NOT NULL DEFAULT 'NO_EXPERIENCE', "salary_type" "public"."job_posts_salary_type_enum" NOT NULL DEFAULT 'NEGOTIABLE', "salary_min" integer, "salary_max" integer, "description" text NOT NULL, "requirements" text NOT NULL, "responsibilities" text, "benefits" text, "skills" jsonb, "quantity" integer, "location" jsonb, "status" "public"."job_posts_status_enum" NOT NULL DEFAULT 'DRAFT', "currency" "public"."job_posts_currency_enum" NOT NULL DEFAULT 'VND', "published_at" TIMESTAMP, "expired_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "updated_by" jsonb, "created_by" uuid, CONSTRAINT "PK_1ecf5b9e46cd2940d254204a73a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."cv_documents_file_type_enum" AS ENUM('pdf', 'docx', 'txt')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."cv_documents_upload_status_enum" AS ENUM('PENDING', 'COMPLETED', 'FAILED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "cv_documents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "public_id" character varying NOT NULL, "file_name" character varying NOT NULL, "file_type" "public"."cv_documents_file_type_enum" NOT NULL, "file_url" character varying NOT NULL, "upload_status" "public"."cv_documents_upload_status_enum" NOT NULL DEFAULT 'PENDING', "processing_error" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_6e371b3a5e25ed60200123f75fa" UNIQUE ("public_id"), CONSTRAINT "PK_21adace014b91999c44d43fa988" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "parsed_cv" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "candidate_name" character varying, "email" character varying, "phone" character varying, "total_experience_years" character varying, "current_title" character varying, "skills" text, "education" text, "work_experience" text, "certifications" text, "languages" text, "parsed_at" TIMESTAMP NOT NULL DEFAULT now(), "cv_id" uuid, CONSTRAINT "REL_890b9f52f1e293efb48fab86ae" UNIQUE ("cv_id"), CONSTRAINT "PK_49a09dde70e55c17bc7e9ab1c49" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "match_results" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "overall_score" double precision NOT NULL, "skill_score" double precision NOT NULL, "experience_score" double precision NOT NULL, "education_score" double precision NOT NULL, "title_score" double precision NOT NULL, "matched_skills" text NOT NULL, "missing_skills" text NOT NULL, "explanation" text NOT NULL, "matched_at" TIMESTAMP NOT NULL DEFAULT now(), "job_id" uuid, "parsed_cv_id" uuid, CONSTRAINT "PK_788799fb3b8324d976620b485f2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."job_applications_status_enum" AS ENUM('PENDING', 'VIEWED', 'SHORTLISTED', 'REJECTED', 'INTERVIEW', 'HIRED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "job_applications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "job_id" uuid NOT NULL, "candidate_id" uuid NOT NULL, "cv_id" uuid, "cover_letter" text, "status" "public"."job_applications_status_enum" NOT NULL DEFAULT 'PENDING', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_job_application_candidate" UNIQUE ("job_id", "candidate_id"), CONSTRAINT "PK_c56a5e86707d0f0df18fa111280" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."job_application_status_logs_from_status_enum" AS ENUM('PENDING', 'VIEWED', 'SHORTLISTED', 'REJECTED', 'INTERVIEW', 'HIRED')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."job_application_status_logs_to_status_enum" AS ENUM('PENDING', 'VIEWED', 'SHORTLISTED', 'REJECTED', 'INTERVIEW', 'HIRED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "job_application_status_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "application_id" uuid NOT NULL, "from_status" "public"."job_application_status_logs_from_status_enum", "to_status" "public"."job_application_status_logs_to_status_enum" NOT NULL, "content" text NOT NULL, "changed_by_id" uuid, "changed_by_snapshot" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b3f7f3bb72853c35d44b75e20b5" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."interviews_status_enum" AS ENUM('PENDING', 'ACCEPTED', 'DECLINED', 'CANCELLED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "interviews" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "application_id" uuid NOT NULL, "candidate_id" uuid NOT NULL, "recruiter_id" uuid NOT NULL, "scheduled_at" TIMESTAMP NOT NULL, "duration_minutes" integer NOT NULL DEFAULT '60', "meeting_url" character varying, "location" character varying, "note" text, "status" "public"."interviews_status_enum" NOT NULL DEFAULT 'PENDING', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_fd41af1f96d698fa33c2f070f47" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "candidate_profiles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "current_title" character varying, "total_experience_years" character varying, "summary" text, "skills" jsonb, "education" jsonb, "work_experience" jsonb, "certifications" jsonb, "languages" jsonb, "portfolio_url" character varying, "linkedin_url" character varying, "github_url" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_5a3673f11918bcea56f48549603" UNIQUE ("user_id"), CONSTRAINT "REL_5a3673f11918bcea56f4854960" UNIQUE ("user_id"), CONSTRAINT "PK_8e8cf5b54118601673585218cc4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_sessions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "session_token" character varying NOT NULL, "refresh_token" character varying, "ip_address" character varying, "user_agent" text, "device_name" character varying, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "last_activity_at" TIMESTAMP NOT NULL DEFAULT now(), "expires_at" TIMESTAMP NOT NULL, "revoked_at" TIMESTAMP, "revoke_reason" character varying, CONSTRAINT "UQ_e5eb7a3c7766f941fe16b9edecb" UNIQUE ("session_token"), CONSTRAINT "PK_e93e031a5fed190d4789b6bfd83" PRIMARY KEY ("id"))`,
    );
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
      `ALTER TABLE "recruiters" ADD CONSTRAINT "FK_0c851bd72ee5568e8793794624b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_posts" ADD CONSTRAINT "FK_c2d92b80c8ecec5d94d38fe95e8" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_posts" ADD CONSTRAINT "FK_99666f01665f814e46461e21d3b" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "cv_documents" ADD CONSTRAINT "FK_cb0a7d796f724d3d5c45313ed45" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "parsed_cv" ADD CONSTRAINT "FK_890b9f52f1e293efb48fab86ae5" FOREIGN KEY ("cv_id") REFERENCES "cv_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "match_results" ADD CONSTRAINT "FK_035ab8efc325281d63faf2e38cd" FOREIGN KEY ("job_id") REFERENCES "job_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "match_results" ADD CONSTRAINT "FK_a27ac41f40eec682477efa2fff1" FOREIGN KEY ("parsed_cv_id") REFERENCES "parsed_cv"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_applications" ADD CONSTRAINT "FK_99292c6cd0ed428e8f5b4e22958" FOREIGN KEY ("job_id") REFERENCES "job_posts"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_applications" ADD CONSTRAINT "FK_6ed185c3d4417cc1f5ec3f28e5d" FOREIGN KEY ("candidate_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_applications" ADD CONSTRAINT "FK_166e914b91ef8cefe623738ed22" FOREIGN KEY ("cv_id") REFERENCES "cv_documents"("id") ON DELETE SET NULL ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_application_status_logs" ADD CONSTRAINT "FK_f23b6730c900cf34caaae592f1e" FOREIGN KEY ("application_id") REFERENCES "job_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_application_status_logs" ADD CONSTRAINT "FK_f7c5418239810b0b7d0ec44abf1" FOREIGN KEY ("changed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE`,
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
    await queryRunner.query(
      `ALTER TABLE "candidate_profiles" ADD CONSTRAINT "FK_5a3673f11918bcea56f48549603" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_sessions" ADD CONSTRAINT "FK_e9658e959c490b0a634dfc54783" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "active_log" ADD CONSTRAINT "FK_673234f07b9a71af78e80f53b8b" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "active_log" DROP CONSTRAINT "FK_673234f07b9a71af78e80f53b8b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_sessions" DROP CONSTRAINT "FK_e9658e959c490b0a634dfc54783"`,
    );
    await queryRunner.query(
      `ALTER TABLE "candidate_profiles" DROP CONSTRAINT "FK_5a3673f11918bcea56f48549603"`,
    );
    await queryRunner.query(
      `ALTER TABLE "interviews" DROP CONSTRAINT "FK_978934041f0a0d6e083c7c7e72e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "interviews" DROP CONSTRAINT "FK_74f05927fc5dd3d5258bad5f609"`,
    );
    await queryRunner.query(
      `ALTER TABLE "interviews" DROP CONSTRAINT "FK_77f7078daea9f2b36e9ff761bd1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_application_status_logs" DROP CONSTRAINT "FK_f7c5418239810b0b7d0ec44abf1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_application_status_logs" DROP CONSTRAINT "FK_f23b6730c900cf34caaae592f1e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_applications" DROP CONSTRAINT "FK_166e914b91ef8cefe623738ed22"`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_applications" DROP CONSTRAINT "FK_6ed185c3d4417cc1f5ec3f28e5d"`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_applications" DROP CONSTRAINT "FK_99292c6cd0ed428e8f5b4e22958"`,
    );
    await queryRunner.query(
      `ALTER TABLE "match_results" DROP CONSTRAINT "FK_a27ac41f40eec682477efa2fff1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "match_results" DROP CONSTRAINT "FK_035ab8efc325281d63faf2e38cd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "parsed_cv" DROP CONSTRAINT "FK_890b9f52f1e293efb48fab86ae5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "cv_documents" DROP CONSTRAINT "FK_cb0a7d796f724d3d5c45313ed45"`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_posts" DROP CONSTRAINT "FK_99666f01665f814e46461e21d3b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_posts" DROP CONSTRAINT "FK_c2d92b80c8ecec5d94d38fe95e8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "recruiters" DROP CONSTRAINT "FK_0c851bd72ee5568e8793794624b"`,
    );
    await queryRunner.query(`DROP TABLE "active_log"`);
    await queryRunner.query(`DROP TYPE "public"."active_log_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."active_log_actor_type_enum"`);
    await queryRunner.query(`DROP TABLE "user_sessions"`);
    await queryRunner.query(`DROP TABLE "candidate_profiles"`);
    await queryRunner.query(`DROP TABLE "interviews"`);
    await queryRunner.query(`DROP TYPE "public"."interviews_status_enum"`);
    await queryRunner.query(`DROP TABLE "job_application_status_logs"`);
    await queryRunner.query(
      `DROP TYPE "public"."job_application_status_logs_to_status_enum"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."job_application_status_logs_from_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "job_applications"`);
    await queryRunner.query(
      `DROP TYPE "public"."job_applications_status_enum"`,
    );
    await queryRunner.query(`DROP TABLE "match_results"`);
    await queryRunner.query(`DROP TABLE "parsed_cv"`);
    await queryRunner.query(`DROP TABLE "cv_documents"`);
    await queryRunner.query(
      `DROP TYPE "public"."cv_documents_upload_status_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."cv_documents_file_type_enum"`);
    await queryRunner.query(`DROP TABLE "job_posts"`);
    await queryRunner.query(`DROP TYPE "public"."job_posts_currency_enum"`);
    await queryRunner.query(`DROP TYPE "public"."job_posts_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."job_posts_salary_type_enum"`);
    await queryRunner.query(
      `DROP TYPE "public"."job_posts_seniority_level_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."job_posts_work_mode_enum"`);
    await queryRunner.query(`DROP TYPE "public"."job_posts_job_type_enum"`);
    await queryRunner.query(`DROP TABLE "companies"`);
    await queryRunner.query(`DROP TABLE "recruiters"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
  }
}
