import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from '../entities/attendance.entity';
import { QueueService } from 'src/queue/queue.service';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private readonly attendanceRepository: Repository<Attendance>,
    private readonly queueService: QueueService,
  ) {}
  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }
  async checkIn(userId: number) {
    const today = this.today();

    const existing = await this.attendanceRepository.findOne({
      where: {
        user: { id: userId },
        date: today,
      },
      relations: ['user'],
    });

    if (existing) {
      throw new BadRequestException('Already checked in today');
    }

    const attendance = this.attendanceRepository.create({
      user: { id: userId } as any,
      date: today,
      checkInTime: new Date().toTimeString().slice(0, 8),
    });

    this.queueService.publish('ATTENDANCE_CHECK_IN', {
      userId,
      date: today,
    });

    return this.attendanceRepository.save(attendance);
  }

  async checkOut(userId: number) {
    const today = this.today();

    const attendance = await this.attendanceRepository.findOne({
      where: {
        user: { id: userId },
        date: today,
      },
      relations: ['user'],
    });

    if (!attendance) {
      throw new BadRequestException('No check-in found for today');
    }

    if (attendance.checkOutTime) {
      throw new BadRequestException('Already checked out');
    }

    attendance.checkOutTime = new Date().toTimeString().slice(0, 8);

    this.queueService.publish('ATTENDANCE_CHECK_OUT', {
      userId,
      date: today,
    });

    return this.attendanceRepository.save(attendance);
  }

  async findMyAttendance(userId: number) {
    return this.attendanceRepository.find({
      where: { user: { id: userId } },
      order: { date: 'DESC' },
    });
  }

  async getAllForAdmin(filters: { date?: string; userId?: number }) {
    const qb = this.attendanceRepository
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.user', 'u')
      .select([
        'a.id',
        'a.date',
        'a.checkInTime',
        'a.checkOutTime',
        'u.id',
        'u.name',
        'u.email',
      ]);

    if (filters.userId) {
      qb.andWhere('u.id = :userId', { userId: filters.userId });
    }

    if (filters.date) {
      qb.andWhere('DATE(a.date) = :date', { date: filters.date });
    }

    return qb.getMany();
  }
}
