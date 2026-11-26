import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { UsersService } from './users.service';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles('admin')
  @Get()
  findAll(
    @Query('role') role: string | undefined,
    @Req() req: { user: { role: string } },
  ) {
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Only admins can view all users');
    }
    return this.usersService.findAll(role);
  }

  @Get('tutors')
  findTutors() {
    return this.usersService.findAll('tutor');
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Req() req: { user: { userId: number; role: string } },
  ) {
    if (req.user.role !== 'admin' && req.user.userId !== id) {
      throw new ForbiddenException('You can only view your own profile');
    }
    return this.usersService.findOne(id);
  }
}