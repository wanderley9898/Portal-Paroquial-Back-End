import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/configuration';
import { RequestLoggerMiddleware } from './middleware/request-logger.middleware';
import { AuthModule } from './modules/auth/auth.module';
import { BroadcastModule } from './modules/broadcast/broadcast.module';
import { NewsModule } from './modules/news/news.module';
import { ParishEventModule } from './modules/parish-event/parish-event.module';
import { UserModule } from './modules/user/user.module';
import { SeedModule } from './seeds/seed.module';
import { S3StorageModule } from './services/aws/s3-storage.module';

@Module({
  imports: [
    // Config
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: (config) => {
        const configured = [
          'S3_ENDPOINT',
          'S3_REGION',
          'S3_ACCESS_KEY',
          'S3_SECRET_KEY',
          'S3_BUCKET',
          'S3_FORCE_PATH_STYLE',
          'S3_PUBLIC_URL',
          'S3_USE_SSL',
          'S3_FOLDER',
        ].some((key) => Boolean(config[key]));
        const missing = [
          ['S3_ENDPOINT', config.S3_ENDPOINT],
          ['S3_ACCESS_KEY', config.S3_ACCESS_KEY],
          ['S3_SECRET_KEY', config.S3_SECRET_KEY],
        ]
          .filter(([, value]) => configured && !value)
          .map(([name]) => name);

        if (missing.length) {
          throw new Error(
            `Missing required S3 configuration: ${missing.join(', ')}`,
          );
        }

        return config;
      },
    }),

    S3StorageModule,
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

    // Authentication
    AuthModule,

    // Users
    UserModule,

    // Content
    NewsModule,
    ParishEventModule,
    BroadcastModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
