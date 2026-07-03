import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBlockedJobPostStatus1783019772125
  implements MigrationInterface
{
  name = 'AddBlockedJobPostStatus1783019772125';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."job_posts_status_enum" ADD VALUE IF NOT EXISTS 'BLOCKED'`,
    );
  }

  public async down(): Promise<void> {
    // Postgres không hỗ trợ xoá giá trị enum trực tiếp. Bỏ qua khi rollback —
    // chấp nhận được vì chỉ mở rộng danh sách trạng thái, không ảnh hưởng dữ liệu cũ.
  }
}
