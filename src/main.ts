import {
  BadRequestException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { join } from 'path';
import { AppModule } from './app.module';
import configuration from './config/configuration';
import { LoggingInterceptor } from './interceptors/logging.interceptor';
import { SeedService } from './seeds/seed.service';
import { CustomLogger } from './utils/custom-logger.util';

const extractValidationMessages = (errors: ValidationError[]): string[] => {
  return errors.flatMap((error) => {
    const ownMessages = error.constraints
      ? Object.values(error.constraints)
      : [];
    const childrenMessages = error.children?.length
      ? extractValidationMessages(error.children)
      : [];

    return [...ownMessages, ...childrenMessages];
  });
};

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: new CustomLogger(),
  });

  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      //forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) =>
        new BadRequestException({
          message: extractValidationMessages(errors),
          error: 'Bad Request',
          statusCode: 400,
        }),
    }),
  );
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useStaticAssets(join(process.cwd(), 'public'));

  const config = new DocumentBuilder()
    .addBearerAuth()
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const shouldRunSeedOnStart =
    String(process.env.RUN_SEED_ON_START ?? 'false').toLowerCase() === 'true';

  if (shouldRunSeedOnStart) {
    const seedService = app.get(SeedService);
    await seedService.runSeed();
  }

  await app.listen(configuration().port, () => {
    console.log(`Application is running on: ${configuration().port}`);
  });
}

bootstrap();
