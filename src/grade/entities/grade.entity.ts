import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';

@Entity('grades')
@Unique(['studentNim', 'courseId', 'semester', 'academicYear'])
export class Grade {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  studentNim: string;

  @Column()
  courseId: number;

  @Column()
  courseName: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  quiz: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  assignment: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  midterm: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  final: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  finalScore: number;

  @Column({ nullable: true })
  letterGrade: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  gradePoint: number;

  @Column()
  semester: number;

  @Column()
  academicYear: string;

  @Column({ default: 'draft' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
