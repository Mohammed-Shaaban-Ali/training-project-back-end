import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSchoolTypes1756048001392 implements MigrationInterface {
    name = 'AddSchoolTypes1756048001392'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "school_types" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_22d87c8656c62997db427a26ff6" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "school_types"`);
    }

}
