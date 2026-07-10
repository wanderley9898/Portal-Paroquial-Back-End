import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupportMessage, SupportTicket, User } from 'src/entities';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { AdminSupportController } from './admin-support.controller';
import { SupportController } from './support.controller';
import { SupportGateway } from './support.gateway';
import { SupportService } from './support.service';

@Module({
  imports: [
    AuthModule,
    UserModule,
    TypeOrmModule.forFeature([SupportTicket, SupportMessage, User]),
  ],
  controllers: [SupportController, AdminSupportController],
  providers: [SupportService, SupportGateway],
  exports: [SupportService],
})
export class SupportModule {}
