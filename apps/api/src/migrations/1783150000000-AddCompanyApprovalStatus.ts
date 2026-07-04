import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCompanyApprovalStatus1783150000000 implements MigrationInterface {
  name = 'AddCompanyApprovalStatus1783150000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Công ty đăng ký mới phải chờ admin duyệt; dữ liệu cũ giữ nguyên ACTIVE.
    await queryRunner.query(
      `ALTER TABLE "companies" ALTER COLUMN "status" SET DEFAULT 'PENDING_APPROVAL'`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD "rejection_reason" text`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "companies" DROP COLUMN "rejection_reason"`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ALTER COLUMN "status" SET DEFAULT 'ACTIVE'`,
    );
  }
}
