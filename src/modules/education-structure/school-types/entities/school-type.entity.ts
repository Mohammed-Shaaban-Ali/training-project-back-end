import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { EducationType } from '../../education-types/entities/education-type.entity';

@Entity('school_types')
export class SchoolType {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @OneToMany(() => EducationType, (educationType) => educationType.schoolType)
  educationTypes: EducationType[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
