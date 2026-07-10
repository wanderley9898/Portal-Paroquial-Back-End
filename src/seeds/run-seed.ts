import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { SeedService } from './seed.service';

async function runSeed() {
  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    const seedService = app.get(SeedService);
    await seedService.runSeed();
  } finally {
    await app.close();
  }
}

runSeed().catch((error) => {
  console.error('Falha ao executar seed:', error);
  process.exit(1);
});
