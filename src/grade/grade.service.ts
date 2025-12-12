import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Grade } from "./entities/grade.entity";
import { CreateGradeDto, UpdateGradeDto } from "./dto/grade.dto";
import { RabbitmqService } from "./rabbitmq/rabbitmq.service";

@Injectable()
export class GradeService {
  constructor(
    @InjectRepository(Grade)
    private gradeRepository: Repository<Grade>,
    private rabbitmqService: RabbitmqService
  ) {}

  private calculateLetterGrade(score: number): string {
    if (score >= 85) return "A";
    if (score >= 75) return "B";
    if (score >= 65) return "C";
    if (score >= 55) return "D";
    return "E";
  }

  private calculateGradePoint(letterGrade: string): number {
    const gradePoints = {
      A: 4.0,
      B: 3.0,
      C: 2.0,
      D: 1.0,
      E: 0.0,
    };
    return gradePoints[letterGrade] || 0.0;
  }

  private calculateFinalScore(grade: Grade): void {
    const quiz = grade.quiz || 0;
    const assignment = grade.assignment || 0;
    const midterm = grade.midterm || 0;
    const final = grade.final || 0;

    // Weighted calculation: Quiz 15%, Assignment 15%, Midterm 30%, Final 40%
    grade.finalScore =
      quiz * 0.15 + assignment * 0.15 + midterm * 0.3 + final * 0.4;
    grade.letterGrade = this.calculateLetterGrade(grade.finalScore);
    grade.gradePoint = this.calculateGradePoint(grade.letterGrade);
  }

  async create(createGradeDto: CreateGradeDto): Promise<Grade> {
    const grade = this.gradeRepository.create(createGradeDto);
    this.calculateFinalScore(grade);
    return this.gradeRepository.save(grade);
  }

  async findAll(): Promise<Grade[]> {
    return this.gradeRepository.find();
  }

  async findOne(id: number): Promise<Grade> {
    const grade = await this.gradeRepository.findOne({ where: { id } });
    if (!grade) {
      throw new NotFoundException(`Grade with ID ${id} not found`);
    }
    return grade;
  }

  async findByStudent(studentNim: string): Promise<Grade[]> {
    return this.gradeRepository.find({ where: { studentNim } });
  }

  async findByCourse(courseId: number): Promise<Grade[]> {
    return this.gradeRepository.find({ where: { courseId } });
  }

  async update(id: number, updateGradeDto: UpdateGradeDto): Promise<Grade> {
    const grade = await this.findOne(id);
    Object.assign(grade, updateGradeDto);
    this.calculateFinalScore(grade);
    return this.gradeRepository.save(grade);
  }

  async remove(id: number): Promise<void> {
    const grade = await this.findOne(id);
    await this.gradeRepository.remove(grade);
  }

  async finalizeGrade(id: number): Promise<Grade> {
    const grade = await this.findOne(id);
    grade.status = "finalized";
    const result = await this.gradeRepository.save(grade);

    // Send notification via RabbitMQ
    await this.rabbitmqService.publishGradeNotification({
      studentNim: grade.studentNim,
      courseName: grade.courseName,
      letterGrade: grade.letterGrade,
      finalScore: grade.finalScore,
    });

    return result;
  }

  async calculateGPA(
    studentNim: string,
    semester?: number,
    academicYear?: string
  ): Promise<any> {
    const query = this.gradeRepository
      .createQueryBuilder("grade")
      .where("grade.studentNim = :studentNim", { studentNim })
      .andWhere("grade.status = :status", { status: "finalized" });

    if (semester) {
      query.andWhere("grade.semester = :semester", { semester });
    }
    if (academicYear) {
      query.andWhere("grade.academicYear = :academicYear", { academicYear });
    }

    const grades = await query.getMany();

    if (grades.length === 0) {
      return { gpa: 0, totalCredits: 0, grades: [] };
    }

    const totalGradePoints = grades.reduce(
      (sum, grade) => sum + (grade.gradePoint || 0),
      0
    );
    const gpa = totalGradePoints / grades.length;

    return {
      gpa: gpa.toFixed(2),
      totalCourses: grades.length,
      grades: grades.map((g) => ({
        courseName: g.courseName,
        letterGrade: g.letterGrade,
        gradePoint: g.gradePoint,
        finalScore: g.finalScore,
      })),
    };
  }

  async generateTranscript(studentNim: string): Promise<any> {
    const grades = await this.gradeRepository.find({
      where: { studentNim, status: "finalized" },
      order: { academicYear: "ASC", semester: "ASC" },
    });

    // Queue report generation job
    await this.rabbitmqService.publishReportGeneration({
      type: "transcript",
      studentNim,
      timestamp: new Date(),
    });

    return {
      studentNim,
      totalCourses: grades.length,
      grades: grades,
    };
  }
}
