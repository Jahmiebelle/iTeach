import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Subject } from './subjects.entity';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';

@Injectable()
export class SubjectsService {
  constructor(
    @InjectRepository(Subject)
    private readonly subjectsRepository: Repository<Subject>,
  ) {}

  async create(dto: CreateSubjectDto) {
    const code = dto.code.trim().toUpperCase();
    const existing = await this.subjectsRepository.findOne({ where: { code } });
    if (existing) {
      throw new ConflictException(`Subject with code ${code} already exists`);
    }

    const subject = this.subjectsRepository.create({
      code,
      title: dto.title.trim(),
      description: dto.description?.trim(),
      isActive: dto.isActive ?? true,
    });
    return this.subjectsRepository.save(subject);
  }

  async findAll(search?: string, activeOnly?: string) {
    const qb = this.subjectsRepository
      .createQueryBuilder('subject')
      .orderBy('subject.id', 'ASC');

    if (activeOnly === 'true') {
      qb.andWhere('subject.isActive = :isActive', { isActive: true });
    }

    if (search?.trim()) {
      const term = `%${search.trim().toLowerCase()}%`;
      qb.andWhere(
        '(LOWER(subject.code) LIKE :term OR LOWER(subject.title) LIKE :term)',
        { term },
      );
    }

    return qb.getMany();
  }

  async count() {
    const total = await this.subjectsRepository.count();
    return { total };
  }

  async findByCode(code: string) {
    const normalized = code.trim().toUpperCase();
    const subject = await this.subjectsRepository.findOne({
      where: { code: normalized },
    });
    if (!subject) {
      throw new NotFoundException(`Subject ${normalized} not found`);
    }
    return subject;
  }

  async findOne(id: number) {
    const subject = await this.subjectsRepository.findOne({
      where: { id },
      relations: { sessions: true },
    });
    if (!subject) {
      throw new NotFoundException(`Subject #${id} not found`);
    }
    return subject;
  }

  async findSessionsBySubject(id: number) {
    const subject = await this.findOne(id);
    return subject.sessions ?? [];
  }

  async update(id: number, dto: UpdateSubjectDto) {
    const subject = await this.findOne(id);

    if (dto.code) {
      const normalizedCode = dto.code.trim().toUpperCase();
      const conflict = await this.subjectsRepository.findOne({
        where: { code: normalizedCode },
      });
      if (conflict && conflict.id !== id) {
        throw new ConflictException(`Subject code ${normalizedCode} is already in use`);
      }
      subject.code = normalizedCode;
    }

    if (dto.title !== undefined) subject.title = dto.title.trim();
    if (dto.description !== undefined) subject.description = dto.description.trim();
    if (dto.isActive !== undefined) subject.isActive = dto.isActive;

    return this.subjectsRepository.save(subject);
  }

  async setActiveStatus(id: number, isActive: boolean) {
    const subject = await this.findOne(id);
    subject.isActive = isActive;
    return this.subjectsRepository.save(subject);
  }

  async remove(id: number) {
    const subject = await this.findOne(id);
    await this.subjectsRepository.remove(subject);
    return { deleted: true, id };
  }
}