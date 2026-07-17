import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from './config/configuration';
import { RequestLoggerMiddleware } from './middleware/request-logger.middleware';
import { AuthModule } from './modules/auth/auth.module';
import { NewsModule } from './modules/news/news.module';
import { UserModule } from './modules/user/user.module';
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

    // Authentication
    AuthModule,

    // Users
    UserModule,

    // Content
    NewsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
