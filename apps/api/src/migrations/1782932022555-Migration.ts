import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1782932022555 implements MigrationInterface {
  name = 'Migration1782932022555';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Các giá trị cũ được lưu dạng "timestamp without time zone" nhưng thực chất
    // đã là giờ UTC (do driver ghi/đọc không nhất quán gây lệch giờ khi lọc theo
    // khoảng thời gian) — chuyển sang "timestamptz", diễn giải giá trị cũ là UTC
    // để giữ đúng nghĩa thời điểm đã lưu.
    await queryRunner.query(
      `ALTER TABLE "ai_usage_logs" ALTER COLUMN "created_at" TYPE timestamptz USING "created_at" AT TIME ZONE 'UTC'`,
    );
    await queryRunner.query(
      `ALTER TABLE "ai_providers" ALTER COLUMN "last_checked_at" TYPE timestamptz USING "last_checked_at" AT TIME ZONE 'UTC'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ai_providers" ALTER COLUMN "last_checked_at" TYPE timestamp USING "last_checked_at" AT TIME ZONE 'UTC'`,
    );
    await queryRunner.query(
      `ALTER TABLE "ai_usage_logs" ALTER COLUMN "created_at" TYPE timestamp USING "created_at" AT TIME ZONE 'UTC'`,
    );
  }
}
