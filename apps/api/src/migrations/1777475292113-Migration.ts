import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1777475292113 implements MigrationInterface {
  name = 'Migration1777475292113';

  public async up(_queryRunner: QueryRunner): Promise<void> {}

  public async down(_queryRunner: QueryRunner): Promise<void> {}
}
