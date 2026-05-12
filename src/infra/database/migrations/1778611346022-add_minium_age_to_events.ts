import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMiniumAgeToEvents1778611346022 implements MigrationInterface {
  name = 'AddMiniumAgeToEvents1778611346022';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "events" ADD "is_age_restricted" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "events" DROP COLUMN "is_age_restricted"`,
    );
  }
}
