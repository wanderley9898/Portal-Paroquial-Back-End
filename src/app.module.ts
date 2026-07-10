import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/configuration';
import { RequestLoggerMiddleware } from './middleware/request-logger.middleware';
import { AuthModule } from './modules/auth/auth.module';
import { CampaignModule } from './modules/campaign/campaign.module';
import { CharacterModule } from './modules/character/character.module';
import { MailerModule } from './modules/mailer/mailer.module';
import { PermissionGroupModule } from './modules/permission-group/permission-group.module';
import { ResourcesModule } from './modules/resources/resources.module';
import { SupportModule } from './modules/support/support.module';
import { TagModule } from './modules/tag/tag.module';
import { UserModule } from './modules/user/user.module';
import { WorldModule } from './modules/world/world.module';
import { SeedModule } from './seeds/seed.module';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    // Config typeOrm
    TypeOrmModule.forRoot({
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
      synchronize: false,
      type: 'postgres',
      extra: {
        client_encoding: 'UTF8',
      },

      database: configuration().database.databaseName,
      host: configuration().database.host,
      port: configuration().database.port,
      password: configuration().database.password,
      username: configuration().database.username,
      schema: configuration().database.schema,
    }),

    // Seeds
    SeedModule,

    // Email service
    MailerModule,

    // Authentication
    AuthModule,
    PermissionGroupModule,
    ResourcesModule,

    // Users
    UserModule,

    // Content
    CampaignModule,
    CharacterModule,
    SupportModule,
    TagModule,
    WorldModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
