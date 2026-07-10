import { ConsoleLogger } from '@nestjs/common';

export class CustomLogger extends ConsoleLogger {
  private customFormatMessage(
    level: string,
    message: string,
    context?: string,
  ) {
    const timestamp = new Date().toISOString();
    const contextStr = context ? `[${context}]` : '';
    return `[${timestamp}] ${level} ${contextStr} ${message}`;
  }

  log(message: string, context?: string) {
    console.log(
      `\x1b[32m${this.customFormatMessage('LOG', message, context)}\x1b[0m`,
    );
  }

  error(message: string, trace?: string, context?: string) {
    console.error(
      `\x1b[31m${this.customFormatMessage('ERROR', message, context)}\x1b[0m`,
    );
    if (trace) {
      console.error(`\x1b[31m${trace}\x1b[0m`);
    }
  }

  warn(message: string, context?: string) {
    console.warn(
      `\x1b[33m${this.customFormatMessage('WARN', message, context)}\x1b[0m`,
    );
  }

  debug(message: string, context?: string) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(
        `\x1b[36m${this.customFormatMessage('DEBUG', message, context)}\x1b[0m`,
      );
    }
  }

  verbose(message: string, context?: string) {
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `\x1b[35m${this.customFormatMessage('VERBOSE', message, context)}\x1b[0m`,
      );
    }
  }
}
