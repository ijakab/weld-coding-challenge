import { CommonModule } from './common/common.module';
import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const initMicroservice = async (app: INestApplication) => {
  app.connectMicroservice({
    // Setup communication protocol here
  });
  await app.startAllMicroservices();
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await initMicroservice(app);
  await app.listen(3000);
}

bootstrap().catch(console.error);
