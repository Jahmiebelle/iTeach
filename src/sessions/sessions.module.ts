import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from './sessions.entity';
import { User } from '../users/user.entity';
import { Subject } from '../subjects/subjects.entity';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Session, User, Subject])],
  controllers: [SessionsController],
  providers: [SessionsService],
  exports: [TypeOrmModule, SessionsService],
})
export class SessionsModule {}