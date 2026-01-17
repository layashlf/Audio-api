import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { PrismaService } from '../prisma/prisma.service';
import { AUDIT_LOG_KEY } from '../config/constant';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);

  constructor(
    private reflector: Reflector,
    private prisma: PrismaService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const action = this.reflector.get<string>(
      AUDIT_LOG_KEY,
      context.getHandler(),
    );
    if (!action) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const method = request.method;
    const url = request.url;

    return next.handle().pipe(
      tap(async (data) => {
        const userId = user?.id || data?.user?.id || data?.id;
        if (!userId) return;

        await this.prisma.auditLog.create({
          data: {
            action,
            userId,
            metadata: {
              method,
              url,
              body: request.body,
              status: 'SUCCESS',
            },
          },
        });
        this.logger.log(`Audit Log: ${action} by user ${userId}`);
      }),
      catchError(async (err) => {
        const userId = user?.id;
        if (userId) {
          await this.prisma.auditLog.create({
            data: {
              action,
              userId,
              metadata: {
                method,
                url,
                error: err.message,
                body: request.body,
                status: 'ERROR',
              },
            },
          });
        }
        throw err;
      }),
    );
  }
}
