import { Type } from 'class-transformer';
import { IsDate, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSessionDto {
  @IsInt()
  @Type(() => Number)
  studentId: number;

  @IsInt()
  @Type(() => Number)
  tutorId: number;

  @IsInt()
  @Type(() => Number)
  subjectId: number;

  @IsDate()
  @Type(() => Date)
  scheduledAt: Date;


}