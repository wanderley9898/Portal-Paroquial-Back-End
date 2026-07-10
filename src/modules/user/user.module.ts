import { Global, Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IsEmailAlreadyExistConstraint } from 'src/decorators';
import { PermissionGroup, User } from 'src/entities';
import { Campaign } from 'src/entities/campaign.entity';
import { Character } from 'src/entities/character.entity';
import { World } from 'src/entities/world.entity';
import { AdminUserController } from './admin-user.controller';
import { AdminUserService } from './admin-user.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      PermissionGroup,
      World,
      Campaign,
      Character,
    ]),
  ],
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
