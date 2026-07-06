import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Thêm cột embedding (pgvector) cho job_posts và parsed_cv để lọc thô ứng viên
 * bằng cosine similarity trong Postgres trước khi gọi LLM chấm điểm chi tiết.
 *
 * LƯU Ý HẠ TẦNG: extension `vector` phải được cài sẵn trong Postgres. Với dev
 * đã cài `postgresql-16-pgvector` vào container global-postgres; production cần
 * bake pgvector vào image Postgres, nếu không migration sẽ lỗi ở CREATE EXTENSION.
 * Số chiều 768 khớp model embedding `text-embedding-004` của Gemini.
 */
export class AddEmbeddingColumns1783200000000 implements MigrationInterface {
  name = 'AddEmbeddingColumns1783200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS vector`);

    await queryRunner.query(
      `ALTER TABLE "job_posts" ADD COLUMN IF NOT EXISTS "embedding" vector(768)`,
    );
    await queryRunner.query(
      `ALTER TABLE "parsed_cv" ADD COLUMN IF NOT EXISTS "embedding" vector(768)`,
    );

    // HNSW cho truy vấn cosine gần nhất; cột NULL bị index bỏ qua nên an toàn
    // khi dữ liệu cũ chưa có embedding.
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
    // Không DROP EXTENSION vector vì có thể dùng chung với DB/bảng khác.
  }
}
