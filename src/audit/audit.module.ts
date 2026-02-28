import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLog } from '../entities/audit-log.entity';
import { AuditService } from './audit.service';
import { QueueModule } from '../queue/queue.module';
import { QueueService } from '../queue/queue.service';
import { AuditController } from './audit.controller';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog]), QueueModule],
  providers: [AuditService],
  controllers: [AuditController],
})
export class AuditModule implements OnModuleInit {
  constructor(
    private readonly queueService: QueueService,
    private readonly auditService: AuditService,
  ) {}

  onModuleInit() {
    this.queueService.subscribe('ATTENDANCE_CHECK_IN', (payload) =>
      this.auditService.log('ATTENDANCE_CHECK_IN', payload),
    );

    this.queueService.subscribe('ATTENDANCE_CHECK_OUT', (payload) =>
      this.auditService.log('ATTENDANCE_CHECK_OUT', payload),
    );

    this.queueService.subscribe('USER_PROFILE_UPDATED', (payload) =>
      this.auditService.log('USER_PROFILE_UPDATED', payload),
    );
  }
}
