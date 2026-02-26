import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendance } from '../entities/attendance.entity';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { QueueModule } from 'src/queue/queue.module';

@Module({
  imports: [TypeOrmModule.forFeature([Attendance]), QueueModule],
  providers: [AttendanceService],
  exports: [AttendanceService],
  controllers: [AttendanceController],
})
export class AttendanceModule {}
