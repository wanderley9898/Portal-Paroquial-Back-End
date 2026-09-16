import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParishEvent } from 'src/entities';
import { ParishEventController } from './parish-event.controller';
import { ParishEventService } from './parish-event.service';

@Module({
  imports: [TypeOrmModule.forFeature([ParishEvent])],
  controllers: [ParishEventController],
  providers: [ParishEventService],
  exports: [ParishEventService],
})
export class ParishEventModule {}
