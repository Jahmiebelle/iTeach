import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SessionsService } from './sessions.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';
import { RescheduleSessionDto } from './dto/reschedule-session.dto';

@UseGuards(JwtAuthGuard)
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Post()
  create(@Body() dto: CreateSessionDto) {
    return this.sessionsService.create(dto);
  }

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('studentId') studentId?: string,
    @Query('tutorId') tutorId?: string,
    @Query('subjectId') subjectId?: string,
  ) {
    return this.sessionsService.findAll({
      status,
      studentId: studentId ? Number(studentId) : undefined,
      tutorId: tutorId ? Number(tutorId) : undefined,
      subjectId: subjectId ? Number(subjectId) : undefined,
    });
  }

  @Get('upcoming')
  findUpcoming() {
    return this.sessionsService.findUpcoming();
  }

  @Get('student/:studentId')
  findByStudent(@Param('studentId', ParseIntPipe) studentId: number) {
    return this.sessionsService.findByStudent(studentId);
  }

  @Get('tutor/:tutorId')
  findByTutor(@Param('tutorId', ParseIntPipe) tutorId: number) {
    return this.sessionsService.findByTutor(tutorId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.sessionsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateSessionDto,
  ) {
    return this.sessionsService.update(id, dto);
  }

  @Patch(':id/confirm')
  confirm(@Param('id', ParseIntPipe) id: number) {
    return this.sessionsService.updateStatus(id, 'confirmed');
  }

  @Patch(':id/complete')
  complete(@Param('id', ParseIntPipe) id: number) {
    return this.sessionsService.updateStatus(id, 'completed');
  }

  @Patch(':id/cancel')
  cancel(@Param('id', ParseIntPipe) id: number) {
    return this.sessionsService.updateStatus(id, 'cancelled');
  }

  @Patch(':id/reschedule')
  reschedule(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RescheduleSessionDto,
  ) {
    return this.sessionsService.reschedule(id, dto.scheduledAt);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.sessionsService.remove(id);
  }
}