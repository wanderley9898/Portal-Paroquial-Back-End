import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { RequestLoggerMiddleware } from './request-logger.middleware';

describe('RequestLoggerMiddleware', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.restoreAllMocks();
    process.env = { ...originalEnv };
    delete process.env.LOG_INCLUDE_CLIENT_META;
    delete process.env.LOG_VERBOSE_REQUESTS;
    process.env.NODE_ENV = 'production';
  });

  it('oculta metadados do cliente por padrão', () => {
    const middleware = new RequestLoggerMiddleware();
    const loggerLog = jest
      .spyOn((middleware as any).logger, 'log')
      .mockImplementation(() => undefined);

    const req = {
      method: 'GET',
      originalUrl: '/students',
      ip: '127.0.0.1',
      headers: {
        'user-agent': 'jest-agent',
        authorization: 'Bearer token',
      },
    } as any;

    const res = {
      statusCode: 200,
      end: jest.fn(),
    } as any;

    const next = jest.fn();

    middleware.use(req, res, next);

    res.end();

    expect(next).toHaveBeenCalledTimes(1);
    expect(loggerLog).toHaveBeenCalledWith(
      expect.not.stringContaining('127.0.0.1'),
    );
    expect(loggerLog).toHaveBeenCalledWith(
      expect.not.stringContaining('jest-agent'),
    );
  });

  it('inclui metadados do cliente quando flag está ativa', () => {
    process.env.LOG_INCLUDE_CLIENT_META = 'true';

    const middleware = new RequestLoggerMiddleware();
    const loggerLog = jest
      .spyOn((middleware as any).logger, 'log')
      .mockImplementation(() => undefined);

    const req = {
      method: 'GET',
      originalUrl: '/students',
      ip: '127.0.0.1',
      headers: {
        'user-agent': 'jest-agent',
        authorization: 'Bearer token',
      },
    } as any;

    const res = {
      statusCode: 200,
      end: jest.fn(),
    } as any;

    middleware.use(req, res, jest.fn());

    res.end();

    expect(loggerLog).toHaveBeenCalledWith(
      expect.stringContaining('127.0.0.1'),
    );
  });
});
