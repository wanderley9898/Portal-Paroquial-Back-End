import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Service } from './s3.service';

describe('S3Service upload startup check', () => {
  const createService = (
    endpoint: string | undefined,
    send: jest.Mock,
  ): S3Service => {
    const client = { send } as unknown as S3Client;
    const configService = {
      get: jest.fn((key: string, defaultValue?: string) => {
        const values: Record<string, string | undefined> = {
          's3.bucketName': 'test-bucket',
          's3.endpoint': endpoint,
          's3.folder': 'test-uploads',
        };
        return values[key] ?? defaultValue;
      }),
    } as unknown as ConfigService;

    return new S3Service(client, configService);
  };

  it('uploads and removes a temporary object when S3 is enabled', async () => {
    const send = jest.fn().mockResolvedValue({});
    const service = createService('http://localhost:9000', send);

    await service.checkUploadAvailability();

    expect(send).toHaveBeenCalledTimes(2);
    const [upload, remove] = send.mock.calls.map(([command]) => command);
    expect(upload).toBeInstanceOf(PutObjectCommand);
    expect(upload.input).toMatchObject({
      Bucket: 'test-bucket',
      Key: expect.stringMatching(/^test-uploads\/health-checks\/.+\.txt$/),
      ACL: 'public-read',
      Body: 'S3 upload health check',
    });
    expect(remove).toBeInstanceOf(DeleteObjectCommand);
    expect(remove.input).toMatchObject({
      Bucket: 'test-bucket',
      Key: upload.input.Key,
    });
  });

  it('skips the S3 check when file uploads use memory storage', async () => {
    const send = jest.fn();
    const service = createService(undefined, send);

    await service.onApplicationBootstrap();

    expect(send).not.toHaveBeenCalled();
  });

  it('logs a failed check without blocking application startup', async () => {
    const send = jest.fn().mockRejectedValue(new Error('S3 unavailable'));
    const service = createService('http://localhost:9000', send);
    const loggerError = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation();

    await expect(service.onApplicationBootstrap()).resolves.toBeUndefined();
    expect(loggerError).toHaveBeenCalledWith(
      'Não foi possível validar o serviço de upload S3; uploads podem falhar.',
      expect.any(String),
    );

    loggerError.mockRestore();
  });
});
