import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1724518800000 implements MigrationInterface {
  name = 'CreateUsersTable1724518800000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum type for user roles (with safe handling if it already exists)
    await queryRunner.query(`
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_enum') THEN
          CREATE TYPE "user_role_enum" AS ENUM('teacher', 'student', 'moderator', 'super_admin');
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" BIGSERIAL NOT NULL,
        "name" character varying(255) NOT NULL,
        "email" character varying(255) NOT NULL,
        "teacher_id" bigint,
        "password" character varying(255) NOT NULL,
        "role" "user_role_enum" NOT NULL,
        "phone" character varying(20),
        "image" character varying(255),
        "active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "IDX_users_email_teacher_id" ON "users" ("email", "teacher_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_email_teacher_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);
    await queryRunner.query(`
      DO $$ 
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role_enum') THEN
          DROP TYPE "user_role_enum";
        END IF;
      END $$;
    `);
  }
}
