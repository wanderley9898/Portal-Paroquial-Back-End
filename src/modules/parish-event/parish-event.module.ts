import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParishEvent } from 'src/entities';
import { ParishEventController } from './parish-event.controller';
import { ParishEventService } from './parish-event.service';
import { S3StorageModule } from 'src/services/aws/s3-storage.module';

@Module({
  imports: [TypeOrmModule.forFeature([ParishEvent]), S3StorageModule],
  controllers: [ParishEventController],
  providers: [ParishEventService],
  exports: [ParishEventService],
})
export class ParishEventModule {}
