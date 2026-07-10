import { S3Client } from '@aws-sdk/client-s3';
import envs from './configuration';

const awsCredentials = envs().aws;

export const s3Config = new S3Client({
  region: awsCredentials.region,
  credentials: {
    accessKeyId: awsCredentials.accessKeyId,
    secretAccessKey: awsCredentials.secretAccessKey,
  },
});
