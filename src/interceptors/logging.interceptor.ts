import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  private shouldIncludeClientMeta(): boolean {
    return process.env.LOG_INCLUDE_CLIENT_META === 'true';
  }

  private buildClientMeta(ip: string, userAgent: string): string {
    if (!this.shouldIncludeClientMeta()) {
      return '';
    }

    return ` - ${ip} - ${userAgent}`;
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const clientMeta = this.buildClientMeta(ip, userAgent);

    const startTime = Date.now();

    // Log da requisição entrante
    this.logger.log(`🔵 ${method} ${url}${clientMeta}`);

    return next.handle().pipe(
      tap({
        next: (responseBody) => {
          const endTime = Date.now();
          const responseTime = endTime - startTime;
          const statusCode = response.statusCode;

          // Log da resposta
          this.logger.log(
            `🟢 ${method} ${url} - ${statusCode} - ${responseTime}ms${clientMeta}`,
          );

          // Log adicional para respostas lentas (>1000ms)
          if (responseTime > 1000) {
            this.logger.warn(
              `⚠️  SLOW RESPONSE: ${method} ${url} - ${responseTime}ms`,
            );
          }
        },
        error: (error) => {
          const endTime = Date.now();
          const responseTime = endTime - startTime;
          const statusCode = response.statusCode || 500;

          // Log de erro
          this.logger.error(
            `🔴 ${method} ${url} - ${statusCode} - ${responseTime}ms${clientMeta} - ERROR: ${error.message}`,
          );
        },
      }),
    );
  }
}
