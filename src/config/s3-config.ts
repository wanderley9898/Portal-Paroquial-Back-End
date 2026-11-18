import { S3Client } from '@aws-sdk/client-s3';
import envs from './configuration';

const s3ConfigValues = envs().s3;

export const S3_CLIENT = 'S3_CLIENT';
export const S3_SIGNING_CLIENT = 'S3_SIGNING_CLIENT';

export const s3Config = new S3Client({
  endpoint: s3ConfigValues.endpoint,
  region: s3ConfigValues.region,
  forcePathStyle: s3ConfigValues.forcePathStyle,
  credentials: {
    accessKeyId: s3ConfigValues.accessKeyId || '',
    secretAccessKey: s3ConfigValues.secretAccessKey || '',
  },
});

export const s3SigningConfig = new S3Client({
  endpoint: s3ConfigValues.publicUrl || s3ConfigValues.endpoint,
  region: s3ConfigValues.region,
  forcePathStyle: s3ConfigValues.forcePathStyle,
  credentials: {
    accessKeyId: s3ConfigValues.accessKeyId || '',
    secretAccessKey: s3ConfigValues.secretAccessKey || '',
  },
});

export const getUploadedFileUrl = (
  file?: Pick<Express.MulterS3.File, 'key' | 'location'>,
): string | undefined => {
  if (!file) return undefined;
  if (!s3ConfigValues.publicUrl || !file.key) return file.location;

  const publicBase = s3ConfigValues.publicUrl.replace(/\/+$/, '');
  const encodedKey = file.key
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');

  return `${publicBase}/${encodeURIComponent(s3ConfigValues.bucketName)}/${encodedKey}`;
};
