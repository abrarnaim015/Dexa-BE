import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { seedAdmin } from './seeds/admin.seed';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const dataSource = app.get(DataSource);

  // 🔽 RUN SEEDER MANUALLY (DEV ONLY)
  if (process.env.NODE_ENV === 'development') {
    await seedAdmin(dataSource);
  }

  await app.listen(3000);
}
bootstrap();
