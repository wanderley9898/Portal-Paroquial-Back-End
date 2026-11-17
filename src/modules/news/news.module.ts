import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { News, User } from 'src/entities';
import { NewsController } from './news.controller';
import { NewsService } from './news.service';
import { S3StorageModule } from 'src/services/aws/s3-storage.module';

@Module({
  imports: [TypeOrmModule.forFeature([News, User]), S3StorageModule],
  controllers: [NewsController],
  providers: [NewsService],
  exports: [NewsService],
})
export class NewsModule {}
