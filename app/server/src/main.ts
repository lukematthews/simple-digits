import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { Client } from 'pg';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';

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
  app.use(cookieParser());
  const configService = app.get(ConfigService);
  const corsOriginsEnv = configService.get<string>('CORS_ORIGINS') ?? '';
  const allowedOrigins = corsOriginsEnv
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });
  await app.listen(3000);
}
bootstrap();
