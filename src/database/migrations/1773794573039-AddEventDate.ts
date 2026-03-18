import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEventDate1773794573039 implements MigrationInterface {
    name = 'AddEventDate1773794573039'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "events" ADD "eventDate" TIMESTAMP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "events" DROP COLUMN "eventDate"`);
    }

}
