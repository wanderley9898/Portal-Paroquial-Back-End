import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { CallHandler, ExecutionContext } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { LoggingInterceptor } from './logging.interceptor';

describe('LoggingInterceptor', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.restoreAllMocks();
    process.env = { ...originalEnv };
    delete process.env.LOG_INCLUDE_CLIENT_META;
  });

  function makeContext(): ExecutionContext {
    const request = {
      method: 'GET',
      url: '/school_years',
      ip: '127.0.0.1',
      headers: {
        'user-agent': 'jest-agent',
      },
    };

    const response = {
      statusCode: 200,
    };

    return {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => response,
      }),
    } as ExecutionContext;
  }

  it('não expõe metadados do cliente por padrão', (done) => {
    const interceptor = new LoggingInterceptor();
    const loggerLog = jest
      .spyOn((interceptor as any).logger, 'log')
      .mockImplementation(() => undefined);

    interceptor
      .intercept(makeContext(), {
        handle: () => of({ ok: true }),
      } as CallHandler)
      .subscribe({
        complete: () => {
          const joined = loggerLog.mock.calls
            .map((call) => String(call[0]))
            .join(' ');

          expect(joined).not.toContain('127.0.0.1');
          expect(joined).not.toContain('jest-agent');
          done();
        },
      });
  });

  it('expõe metadados do cliente quando flag está ativa', (done) => {
    process.env.LOG_INCLUDE_CLIENT_META = 'true';

    const interceptor = new LoggingInterceptor();
    const loggerLog = jest
      .spyOn((interceptor as any).logger, 'log')
      .mockImplementation(() => undefined);

    interceptor
      .intercept(makeContext(), {
        handle: () => of({ ok: true }),
      } as CallHandler)
      .subscribe({
        complete: () => {
          const joined = loggerLog.mock.calls
            .map((call) => String(call[0]))
            .join(' ');

          expect(joined).toContain('127.0.0.1');
          expect(joined).toContain('jest-agent');
          done();
        },
      });
  });

  it('mantém logging de erro sem perder a exceção', (done) => {
    const interceptor = new LoggingInterceptor();
    const loggerError = jest
      .spyOn((interceptor as any).logger, 'error')
      .mockImplementation(() => undefined);

    interceptor
      .intercept(makeContext(), {
        handle: () => throwError(() => new Error('boom')),
      } as CallHandler)
      .subscribe({
        error: (error) => {
          expect(error.message).toBe('boom');
          expect(loggerError).toHaveBeenCalledWith(
            expect.stringContaining('ERROR: boom'),
          );
          done();
        },
      });
  });
});
