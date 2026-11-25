import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from './sessions.entity';
import { User } from '../users/user.entity';
import { Subject } from '../subjects/subjects.entity';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionsRepository: Repository<Session>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Subject)
    private readonly subjectsRepository: Repository<Subject>,
  ) {}

  private async validateReferences(
    studentId: number,
    tutorId: number,
    subjectId: number,
  ) {
    if (studentId === tutorId) {
      throw new BadRequestException('Student and tutor must be different users');
    }

    const [student, tutor, subject] = await Promise.all([
      this.usersRepository.findOne({ where: { id: studentId } }),
      this.usersRepository.findOne({ where: { id: tutorId } }),
      this.subjectsRepository.findOne({ where: { id: subjectId } }),
    ]);

    if (!student) throw new NotFoundException(`Student #${studentId} not found`);
    if (!tutor) throw new NotFoundException(`Tutor #${tutorId} not found`);
    if (!subject) throw new NotFoundException(`Subject #${subjectId} not found`);
  }

  async create(dto: CreateSessionDto) {
    await this.validateReferences(dto.studentId, dto.tutorId, dto.subjectId);

    const session = this.sessionsRepository.create({
      studentId: dto.studentId,
      tutorId: dto.tutorId,
      subjectId: dto.subjectId,
      scheduledAt: dto.scheduledAt,
      status: 'pending',
    });

    return this.sessionsRepository.save(session);
  }

  async findAll(filters?: {
    status?: string;
    studentId?: number;
    tutorId?: number;
    subjectId?: number;
  }) {
    const qb = this.sessionsRepository
      .createQueryBuilder('session')
      .leftJoinAndSelect('session.student', 'student')
      .leftJoinAndSelect('session.tutor', 'tutor')
      .leftJoinAndSelect('session.subject', 'subject')
      .orderBy('session.scheduledAt', 'ASC');

    if (filters?.status) {
      qb.andWhere('session.status = :status', { status: filters.status });
    }
    if (filters?.studentId) {
      qb.andWhere('session.studentId = :studentId', {
        studentId: filters.studentId,
      });
    }
    if (filters?.tutorId) {
      qb.andWhere('session.tutorId = :tutorId', { tutorId: filters.tutorId });
    }
    if (filters?.subjectId) {
      qb.andWhere('session.subjectId = :subjectId', {
        subjectId: filters.subjectId,
      });
    }

    return qb.getMany();
  }

  async findUpcoming() {
    return this.sessionsRepository
      .createQueryBuilder('session')
      .leftJoinAndSelect('session.student', 'student')
      .leftJoinAndSelect('session.tutor', 'tutor')
      .leftJoinAndSelect('session.subject', 'subject')
      .where('session.scheduledAt >= :now', { now: new Date() })
      .andWhere('session.status != :cancelled', { cancelled: 'cancelled' })
      .orderBy('session.scheduledAt', 'ASC')
      .getMany();
  }

  async findByStudent(studentId: number) {
    return this.sessionsRepository.find({
      where: { studentId },
      relations: {'tutor': true, 'subject': true},
      order: { scheduledAt: 'ASC' },
    });
  }

  async findByTutor(tutorId: number) {
    return this.sessionsRepository.find({
      where: { tutorId },
      relations: {'student': true, 'subject': true},
      order: { scheduledAt: 'ASC' },
    });
  }

  async findOne(id: number) {
    const session = await this.sessionsRepository.findOne({
      where: { id },
      relations: {'student': true, 'tutor': true, 'subject': true},
    });
    if (!session) {
      throw new NotFoundException(`Session #${id} not found`);
    }
    return session;
  }

  async update(id: number, dto: UpdateSessionDto) {
    const session = await this.findOne(id);
    const nextTutorId = dto.tutorId ?? session.tutorId;
    const nextSubjectId = dto.subjectId ?? session.subjectId;

    await this.validateReferences(session.studentId, nextTutorId, nextSubjectId);

    session.tutorId = nextTutorId;
    session.subjectId = nextSubjectId;
    if (dto.scheduledAt !== undefined) session.scheduledAt = dto.scheduledAt;
    if (dto.status !== undefined) session.status = dto.status;
   

    return this.sessionsRepository.save(session);
  }

  async updateStatus(id: number, status: 'confirmed' | 'completed' | 'cancelled') {
    const session = await this.findOne(id);
    session.status = status;
    return this.sessionsRepository.save(session);
  }

  async reschedule(id: number, scheduledAt: Date) {
    const session = await this.findOne(id);
    session.scheduledAt = scheduledAt;
    session.status = 'pending';
    return this.sessionsRepository.save(session);
  }

  async remove(id: number) {
    const session = await this.findOne(id);
    await this.sessionsRepository.remove(session);
    return { deleted: true, id };
  }
}