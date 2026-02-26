import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from '../entities/audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}
  async log(event: string, payload: any) {
    const log = this.auditLogRepository.create({
      action: event,
      newValue: JSON.stringify(payload),
      user: payload.userId ? ({ id: payload.userId } as any) : null,
    });

    await this.auditLogRepository.save(log);
  }
}
