import { Global, Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IsEmailAlreadyExistConstraint } from 'src/decorators';
import { User } from 'src/entities';
import { S3StorageModule } from 'src/services/aws/s3-storage.module';

import { AdminUserController } from './admin-user.controller';
import { AdminUserService } from './admin-user.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([User]), S3StorageModule],
  controllers: [UserController, AdminUserController],
  providers: [
    UserService,
    JwtService,
    IsEmailAlreadyExistConstraint,
    AdminUserService,
  ],
  exports: [UserService, JwtService],
})
export class UserModule {}
