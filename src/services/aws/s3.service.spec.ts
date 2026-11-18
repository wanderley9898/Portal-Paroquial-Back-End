import {
  DeleteObjectCommand,
  GetObjectCommand,
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
    publicUrl?: string,
  ): S3Service => {
    const client = { send } as unknown as S3Client;
    const signingClient = new S3Client({
      endpoint: publicUrl || endpoint,
      region: 'us-east-1',
      forcePathStyle: true,
      credentials: {
        accessKeyId: 'test-access-key',
        secretAccessKey: 'test-secret-key',
      },
    });
    const configService = {
      get: jest.fn((key: string, defaultValue?: string) => {
        const values: Record<string, string | undefined> = {
          's3.bucketName': 'test-bucket',
          's3.endpoint': endpoint,
          's3.folder': 'test-uploads',
          's3.publicUrl': publicUrl,
        };
        return values[key] ?? defaultValue;
      }),
    } as unknown as ConfigService;

    return new S3Service(client, configService, signingClient);
  };

  it('uploads and removes a temporary object when S3 is enabled', async () => {
    const send = jest.fn().mockResolvedValue({});
    const service = createService('http://localhost:9000', send);

    await service.checkUploadAvailability();

    expect(send).toHaveBeenCalledTimes(3);
    const [upload, read, remove] = send.mock.calls.map(
      ([command]) => command,
    );
    expect(upload).toBeInstanceOf(PutObjectCommand);
    expect(upload.input).toMatchObject({
      Bucket: 'test-bucket',
      Key: expect.stringMatching(/^test-uploads\/health-checks\/.+\.txt$/),
      Body: 'S3 upload health check',
    });
    expect(upload.input).not.toHaveProperty('ACL');
    expect(read).toBeInstanceOf(GetObjectCommand);
    expect(read.input).toMatchObject({
      Bucket: 'test-bucket',
      Key: upload.input.Key,
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

  it('signs image URLs using the public S3 endpoint and path prefix', async () => {
    const service = createService(
      'http://s3.internal:9000',
      jest.fn(),
      'https://files.example.test/paroquia',
    );

    const signedUrl = await service.getSignedUrlForImage(
      'https://files.example.test/paroquia/test-bucket/portal_paroquial/images/foto.jpg',
    );
    if (!signedUrl) throw new Error('Expected a signed image URL.');
    const parsedUrl = new URL(signedUrl);

    expect(parsedUrl.origin).toBe('https://files.example.test');
    expect(parsedUrl.pathname).toBe(
      '/paroquia/test-bucket/portal_paroquial/images/foto.jpg',
    );
    expect(parsedUrl.searchParams.get('X-Amz-Algorithm')).toBe(
      'AWS4-HMAC-SHA256',
    );
  });

  it('leaves external image URLs unchanged', async () => {
    const service = createService(
      'http://s3.internal:9000',
      jest.fn(),
      'https://files.example.test/paroquia',
    );
    const externalUrl = 'https://cdn.example.test/image.jpg';

    await expect(service.getSignedUrlForImage(externalUrl)).resolves.toBe(
      externalUrl,
    );
  });
});
