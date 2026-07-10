import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionGroup, User } from 'src/entities';
import { SeedService } from './seed.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, PermissionGroup])],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
