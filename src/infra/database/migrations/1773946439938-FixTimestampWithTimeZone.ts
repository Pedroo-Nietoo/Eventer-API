import { MigrationInterface, QueryRunner } from "typeorm";

export class FixTimestampWithTimeZone1773946439938 implements MigrationInterface {
    name = 'FixTimestampWithTimeZone1773946439938'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_d39dd89d89fe12aa86872b7865"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_c884e321f927d5b86aac7c8f9e"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`CREATE INDEX "IDX_c884e321f927d5b86aac7c8f9e" ON "orders" ("created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_d39dd89d89fe12aa86872b7865" ON "orders" ("status", "created_at") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_d39dd89d89fe12aa86872b7865"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IDX_c884e321f927d5b86aac7c8f9e"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`CREATE INDEX "IDX_c884e321f927d5b86aac7c8f9e" ON "orders" ("created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_d39dd89d89fe12aa86872b7865" ON "orders" ("status", "created_at") `);
    }

}
