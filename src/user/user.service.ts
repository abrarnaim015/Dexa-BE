import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import { QueueService } from 'src/queue/queue.service';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly queueService: QueueService,
  ) {}
  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }
  async findByEmail(email: string) {
    return this.userRepository.findOne({
      where: { email },
    });
  }
  async create(data: { email: string; password: string; name: string }) {
    const user = this.userRepository.create({
      ...data,
      role: UserRole.EMPLOYEE,
    });

    return this.userRepository.save(user);
  }

  async updateMe(userId: number, dto: UpdateUserDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (dto.phoneNumber) {
      user.phoneNumber = dto.phoneNumber;
    }

    if (dto.oldPassword || dto.newPassword) {
      if (!dto.oldPassword || !dto.newPassword) {
        throw new BadRequestException(
          'Old password and new password are required',
        );
      }
      const isMatch = await bcrypt.compare(dto.oldPassword, user.password);
      if (!isMatch) {
        throw new BadRequestException('Old password is incorrect');
      }

      user.password = await bcrypt.hash(dto.newPassword, 10);
    }

    const updatedUser = await this.userRepository.save(user);

    // emit audit event (async)
    const today = this.today();
    this.queueService.publish('USER_PROFILE_UPDATED', {
      userId: updatedUser.id,
      date: today,
    });

    delete updatedUser.password;
    return {
      meta: {
        status: 'success',
        message: 'User profile updated successfully',
      },
      data: updatedUser,
      errors: [],
    };
  }

  async getUsers(filters: { name?: string; id?: number }) {
    const qb = this.userRepository.createQueryBuilder('u');

    if (filters.id) qb.andWhere('u.id = :id', { id: filters.id });
    if (filters.name)
      qb.andWhere('u.name LIKE :name', { name: `%${filters.name}%` });

    const users = await qb.getMany();
    const result = users.map(({ password, ...rest }) => rest);
    if (!result || result?.length === 0) {
      throw new NotFoundException('User not found');
    }
    return {
      meta: {
        status: 'success',
        message: 'Get Users',
      },
      data: result,
      error: [],
    };
  }

  async updateUser(id: number, data: { name?: string; phoneNumber?: string }) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    if (data.name !== undefined) user.name = data.name;
    if (data.phoneNumber !== undefined) user.phoneNumber = data.phoneNumber;

    const updated = await this.userRepository.save(user);
    const { password, ...result } = updated;
    return {
      meta: {
        status: 'success',
        message: `profile UserId ${id} updated successfully`,
      },
      data: result,
      error: [],
    };
  }
}
