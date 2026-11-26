import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findAll(role?: string) {
    const qb = this.usersRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.fullName',
        'user.email',
        'user.role',
        'user.createdAt',
      ])
      .orderBy('user.id', 'ASC');

    if (role) {
      qb.andWhere('user.role = :role', { role });
    }

    return qb.getMany();
  }

  async findOne(id: number) {
    const user = await this.usersRepository.findOne({
      where: { id },
      select: {
        'id': true,
        'fullName': true,
        'email': true,
        'role': true,
        'createdAt': true,
      },
    });
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return user;
  }
}