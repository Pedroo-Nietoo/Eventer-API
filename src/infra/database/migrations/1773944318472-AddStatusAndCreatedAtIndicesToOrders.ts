import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStatusAndCreatedAtIndicesToOrders1773944318472 implements MigrationInterface {
  name = 'AddStatusAndCreatedAtIndicesToOrders1773944318472';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_orders_status_created_at" ON "orders" ("status", "created_at")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_orders_status_created_at"`,
    );
  }
}
