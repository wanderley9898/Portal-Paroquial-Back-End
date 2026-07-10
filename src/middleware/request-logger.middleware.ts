import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('RequestDetails');

  private shouldIncludeClientMeta(): boolean {
    return process.env.LOG_INCLUDE_CLIENT_META === 'true';
  }

  private shouldLogVerboseRequestDetails(): boolean {
    return (
      process.env.NODE_ENV === 'development' ||
      process.env.LOG_VERBOSE_REQUESTS === 'true'
    );
  }

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip, headers } = req;
    const startTime = Date.now();
    const includeClientMeta = this.shouldIncludeClientMeta();

    if (this.shouldLogVerboseRequestDetails()) {
      this.logger.debug(`📝 Request Details:
        Method: ${method}
        URL: ${originalUrl}
        Content-Type: ${headers['content-type'] || 'N/A'}
        Authorization: ${headers.authorization ? 'Bearer ***' : 'None'}
        Client-Meta: ${includeClientMeta ? `IP=${ip}; User-Agent=${headers['user-agent'] || 'N/A'}` : 'hidden'}
      `);
    }

    // Override do método end da response para capturar o tempo.
    const originalEnd = res.end.bind(res);

    res.end = (chunk?: any, encoding?: any, cb?: any) => {
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      const statusCode = res.statusCode;
      let statusEmoji = '🟢';

      if (statusCode >= 400 && statusCode < 500) {
        statusEmoji = '🟡';
      } else if (statusCode >= 500) {
        statusEmoji = '🔴';
      }

      const clientMeta = includeClientMeta ? ` - ${ip}` : '';

      this.logger.log(
        `${statusEmoji} [${new Date().toISOString()}] ${method} ${originalUrl} - Status: ${statusCode} - ${responseTime}ms${clientMeta}`,
      );

      return originalEnd(chunk, encoding, cb);
    };

    next();
  }
}
