import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { GradeService } from './grade.service';
import { CreateGradeDto, UpdateGradeDto } from './dto/grade.dto';

@Controller('api/grades')
export class GradeController {
  constructor(private readonly gradeService: GradeService) {}

  @Post()
  create(@Body() createGradeDto: CreateGradeDto) {
    return this.gradeService.create(createGradeDto);
  }

  @Get()
  findAll(
    @Query('studentNim') studentNim?: string,
    @Query('courseId') courseId?: string,
  ) {
    if (studentNim) {
      return this.gradeService.findByStudent(studentNim);
    }
    if (courseId) {
      return this.gradeService.findByCourse(+courseId);
    }
    return this.gradeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gradeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGradeDto: UpdateGradeDto) {
    return this.gradeService.update(+id, updateGradeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gradeService.remove(+id);
  }

  @Post(':id/finalize')
  finalize(@Param('id') id: string) {
    return this.gradeService.finalizeGrade(+id);
  }

  @Get('student/:nim/gpa')
  calculateGPA(
    @Param('nim') nim: string,
    @Query('semester') semester?: string,
    @Query('academicYear') academicYear?: string,
  ) {
    return this.gradeService.calculateGPA(
      nim,
      semester ? +semester : undefined,
      academicYear,
    );
  }

  @Get('student/:nim/transcript')
  generateTranscript(@Param('nim') nim: string) {
    return this.gradeService.generateTranscript(nim);
  }
}
