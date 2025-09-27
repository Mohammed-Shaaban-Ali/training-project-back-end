import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SchoolType } from '../../school-types/entities/school-type.entity';

@Entity('education_types')
export class EducationType {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @ManyToOne(() => SchoolType, (schoolType) => schoolType.educationTypes)
  @JoinColumn({ name: 'school_type_id' })
  schoolType: SchoolType;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
