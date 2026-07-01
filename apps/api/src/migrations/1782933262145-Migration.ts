import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1782933262145 implements MigrationInterface {
  name = 'Migration1782933262145';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."ai_providers_vendor_enum" ADD VALUE IF NOT EXISTS 'GROQ'`,
    );
  }

  public async down(): Promise<void> {
    // Postgres không hỗ trợ xoá 1 giá trị enum trực tiếp (ALTER TYPE ... DROP VALUE
    // không tồn tại). Bỏ qua khi rollback — chấp nhận được vì đây chỉ là mở rộng
    // danh sách vendor được hỗ trợ, không ảnh hưởng dữ liệu cũ.
  }
}
