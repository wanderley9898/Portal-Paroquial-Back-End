import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { S3_CLIENT, s3Config } from 'src/config/s3-config';
import { S3Service } from './s3.service';

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: S3_CLIENT,
      useValue: s3Config,
    },
    S3Service,
  ],
  exports: [S3Service],
})
export class S3StorageModule {}
