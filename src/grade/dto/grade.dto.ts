import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateGradeDto {
  @IsString()
  @IsNotEmpty()
  studentNim: string;

  @IsNumber()
  @IsNotEmpty()
  courseId: number;

  @IsString()
  @IsNotEmpty()
  courseName: string;

  @IsNumber()
  @IsOptional()
  quiz?: number;

  @IsNumber()
  @IsOptional()
  assignment?: number;

  @IsNumber()
  @IsOptional()
  midterm?: number;

  @IsNumber()
  @IsOptional()
  final?: number;

  @IsNumber()
  @IsNotEmpty()
  semester: number;

  @IsString()
  @IsNotEmpty()
  academicYear: string;
}

export class UpdateGradeDto {
  @IsNumber()
  @IsOptional()
  quiz?: number;

  @IsNumber()
  @IsOptional()
  assignment?: number;

  @IsNumber()
  @IsOptional()
  midterm?: number;

  @IsNumber()
  @IsOptional()
  final?: number;

  @IsString()
  @IsOptional()
  status?: string;
}
