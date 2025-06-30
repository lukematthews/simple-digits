import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { Client } from 'pg';

async function bootstrap() {
  const testPg = async () => {
    console.log(process.env.DATABASE_URL);
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    try {
      await client.connect();
      console.log('✅ DB connection successful');
      await client.end();
    } catch (err) {
      console.error('❌ DB connection failed:', err.message);
    }
  };

  await testPg();

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
