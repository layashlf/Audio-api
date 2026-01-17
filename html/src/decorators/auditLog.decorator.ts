import { SetMetadata } from '@nestjs/common';
import { AUDIT_LOG_KEY } from '../config/constant';

export const AuditLog = (action?: string) =>
  SetMetadata(AUDIT_LOG_KEY, action || true);
