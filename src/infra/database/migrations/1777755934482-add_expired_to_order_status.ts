import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddExpiredToOrderStatus1777755934482 implements MigrationInterface {
  name = 'AddExpiredToOrderStatus1777755934482';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d39dd89d89fe12aa86872b7865"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."orders_status_enum" RENAME TO "orders_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."orders_status_enum" AS ENUM('PENDING', 'PAID', 'EXPIRED', 'FAILED', 'CANCELLED', 'REFUNDED')`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "status" TYPE "public"."orders_status_enum" USING "status"::"text"::"public"."orders_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'PENDING'`,
    );
    await queryRunner.query(`DROP TYPE "public"."orders_status_enum_old"`);
    await queryRunner.query(
      `CREATE INDEX "IDX_d39dd89d89fe12aa86872b7865" ON "orders" ("status", "created_at") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d39dd89d89fe12aa86872b7865"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."orders_status_enum_old" AS ENUM('PENDING', 'PAID', 'CANCELLED', 'FAILED', 'REFUNDED')`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "status" TYPE "public"."orders_status_enum_old" USING "status"::"text"::"public"."orders_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "status" SET DEFAULT 'PENDING'`,
    );
    await queryRunner.query(`DROP TYPE "public"."orders_status_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."orders_status_enum_old" RENAME TO "orders_status_enum"`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d39dd89d89fe12aa86872b7865" ON "orders" ("created_at", "status") `,
    );
  }
}
