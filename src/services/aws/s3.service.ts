import {
  DeleteObjectCommand,
  GetObjectCommand,
  GetObjectCommandOutput,
  PutObjectAclCommand,
  PutObjectCommand,
  PutObjectCommandInput,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3_CLIENT } from 'src/config/s3-config';

@Injectable()
export class S3Service {
  private readonly bucketName: string;
  private readonly endpoint?: string;
  private readonly publicUrl?: string;

  constructor(
    @Inject(S3_CLIENT) private readonly client: S3Client,
    configService: ConfigService,
  ) {
    this.bucketName = configService.get<string>('s3.bucketName', 'pousada');
    this.endpoint = configService.get<string>('s3.endpoint');
    this.publicUrl = configService.get<string>('s3.publicUrl');
  }

  async generateSignedUrl(key: string, expiresIn = 3600): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.getBucketName(),
      Key: key,
    });

    try {
      return await getSignedUrl(this.client, command, { expiresIn });
    } catch (error) {
      console.error('Erro ao gerar URL assinada:', error);
      throw error;
    }
  }

  async deleteObjectByKey(key: string) {
    return this.client.send(
      new DeleteObjectCommand({
        Key: key,
        Bucket: this.getBucketName(),
      }),
    );
  }

  async generateDownloadUrl(key: string): Promise<string> {
    const command = new GetObjectCommand({
      Key: key,
      Bucket: this.getBucketName(),
    });

    return getSignedUrl(this.client, command, { expiresIn: 3600 });
  }

  async getObjectByKey(key: string): Promise<GetObjectCommandOutput> {
    return this.client.send(
      new GetObjectCommand({
        Key: key,
        Bucket: this.getBucketName(),
      }),
    );
  }

  async getMultipleObjectsByKeys(keys: string[]) {
    return Promise.all(
      keys.map(async (key) => ({
        key,
        object: await this.getObjectByKey(key),
      })),
    );
  }

  async putObject(input: PutObjectCommandInput) {
    return this.client.send(
      new PutObjectCommand({
        ...input,
        Bucket: this.getBucketName(),
      }),
    );
  }

  async makeObjectPublic(key: string): Promise<void> {
    await this.client.send(
      new PutObjectAclCommand({
        Bucket: this.getBucketName(),
        Key: key,
        ACL: 'public-read',
      }),
    );
  }

  extractKeyFromS3Url(url: string): string {
    try {
      const { host, pathname } = new URL(url);
      const configuredHosts = [this.endpoint, this.publicUrl]
        .filter((value): value is string => Boolean(value))
        .map((value) => new URL(value).host);

      if (!host.includes('amazonaws.com') && !configuredHosts.includes(host)) {
        throw new Error('URL não corresponde ao endpoint S3 configurado');
      }

      const segments = pathname
        .split('/')
        .filter(Boolean)
        .map((segment) => decodeURIComponent(segment));

      if (segments[0] === this.bucketName) segments.shift();
      return segments.join('/');
    } catch (error) {
      console.error('Erro ao extrair key do S3:', error);
      return '';
    }
  }

  async deleteImageFromS3IfNeeded(imageUrl?: string | null): Promise<void> {
    if (!imageUrl) return;

    const key = this.extractKeyFromS3Url(imageUrl);
    if (!key) return;

    try {
      await this.deleteObjectByKey(key);
    } catch (error) {
      console.warn(
        'Não foi possível remover a imagem antiga da notícia:',
        error,
      );
    }
  }

  private getBucketName(): string {
    if (!this.endpoint) {
      throw new Error('S3_ENDPOINT is not configured.');
    }
    return this.bucketName;
  }
}
