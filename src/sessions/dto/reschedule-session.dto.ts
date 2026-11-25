import { Type } from 'class-transformer';
import { IsDate } from 'class-validator';

export class RescheduleSessionDto {
  @IsDate()
  @Type(() => Date)
  scheduledAt: Date;
}