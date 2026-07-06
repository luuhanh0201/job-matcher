import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnsureDatabaseExtensionsAndEmbeddingSchema1783330000000
  implements MigrationInterface
{
  name = 'EnsureDatabaseExtensionsAndEmbeddingSchema1783330000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "unaccent"`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "vector"`);

    await queryRunner.query(
      `ALTER TABLE "job_posts" ADD COLUMN IF NOT EXISTS "embedding" vector(768)`,
    );
    await queryRunner.query(
      `ALTER TABLE "parsed_cv" ADD COLUMN IF NOT EXISTS "embedding" vector(768)`,
    );

    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_job_posts_embedding"
       ON "job_posts" USING hnsw ("embedding" vector_cosine_ops)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_parsed_cv_embedding"
       ON "parsed_cv" USING hnsw ("embedding" vector_cosine_ops)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_parsed_cv_embedding"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "idx_job_posts_embedding"`);
    await queryRunner.query(
      `ALTER TABLE "parsed_cv" DROP COLUMN IF EXISTS "embedding"`,
    );
    await queryRunner.query(
      `ALTER TABLE "job_posts" DROP COLUMN IF EXISTS "embedding"`,
    );
  }
}
