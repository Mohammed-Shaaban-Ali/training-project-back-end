import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEductionTypes1756422079540 implements MigrationInterface {
    name = 'AddEductionTypes1756422079540'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "education_types" ("id" SERIAL NOT NULL, "name" character varying(255) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "school_type_id" integer, CONSTRAINT "PK_5984beb605fff249e446874ace7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "education_types" ADD CONSTRAINT "FK_43eb4d9b8cc629e6e51c4183396" FOREIGN KEY ("school_type_id") REFERENCES "school_types"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "education_types" DROP CONSTRAINT "FK_43eb4d9b8cc629e6e51c4183396"`);
        await queryRunner.query(`DROP TABLE "education_types"`);
    }

}
