import { MicroserviceOptions } from '@nestjs/microservices';
import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './worker.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    WorkerModule,
    {
      options: {
        port: 3001,
      },
      // Setup communication protocol here
    },
  );
  app.listen().catch(console.error);
}

bootstrap().catch(console.error);
