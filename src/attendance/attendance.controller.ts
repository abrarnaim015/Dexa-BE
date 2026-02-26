import { Controller, Post, Get, UseGuards, Req, Query } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { UserRole } from 'src/entities/user.entity';
import { Roles } from 'src/auth/roles.decorator';

@Controller('attendance')
@UseGuards(JwtAuthGuard)
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('check-in')
  checkIn(@Req() req) {
    return this.attendanceService.checkIn(req.user.userId);
  }

  @Post('check-out')
  checkOut(@Req() req) {
    return this.attendanceService.checkOut(req.user.userId);
  }

  @Get('me')
  getMyAttendance(@Req() req) {
    return this.attendanceService.findMyAttendance(req.user.userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  getAll(@Query('date') date?: string, @Query('userId') userId?: number) {
    return this.attendanceService.getAllForAdmin({ date, userId });
  }
}
