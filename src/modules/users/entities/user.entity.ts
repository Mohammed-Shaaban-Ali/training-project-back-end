import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum UserRole {
  TEACHER = 'teacher',
  STUDENT = 'student',
  MODERATOR = 'moderator',
  SUPER_ADMIN = 'super_admin',
}

@Entity('users')
@Index(['email', 'teacher_id'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('increment', { type: 'bigint' })
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'bigint', nullable: true })
  teacher_id: number | null;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  role: UserRole;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  image: string | null;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true})
  refreshToken: string | null;

  @Column({ type: 'timestamp', nullable: true})
  refreshTokenExpiryDate: Date | null;

  @Column({ type: 'varchar', length: 255, nullable: true})
  resetToken: string | null;

  @Column({ type: 'timestamp', nullable: true})
  resetTokenExpiryDate: Date | null;

  @CreateDateColumn()
  created_at: Date;
}
