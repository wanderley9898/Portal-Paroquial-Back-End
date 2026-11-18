import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  S3_CLIENT,
  S3_SIGNING_CLIENT,
  s3Config,
  s3SigningConfig,
} from 'src/config/s3-config';
import { S3Service } from './s3.service';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: S3_CLIENT,
      useValue: s3Config,
    },
    {
      provide: S3_SIGNING_CLIENT,
      useValue: s3SigningConfig,
    },
    S3Service,
  ],
  exports: [S3Service],
})
export class S3StorageModule {}
