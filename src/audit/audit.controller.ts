import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { UserRole } from 'src/entities/user.entity';
import { AuditService } from './audit.service';

@Controller('audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AuditController {
  constructor(private readonly auditLogService: AuditService) {}

  @Get()
  async getAuditLogs(@Query('limit') limit?: string) {
    const data = await this.auditLogService.findAll(limit ? Number(limit) : 20);

    return {
      meta: {
        status: 'success',
        message: 'Audit logs retrieved successfully',
      },
      data,
      errors: [],
    };
  }
}
