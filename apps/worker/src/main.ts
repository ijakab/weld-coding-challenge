import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { NestFactory } from '@nestjs/core';
import { WorkerModule } from './common/worker.module';
import { environment } from './environment';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    WorkerModule,
    {
      transport: Transport.KAFKA,
      options: {
        client: {
          brokers: environment.KAFKA_BROKERS.split(','),
          clientId: environment.KAFKA_CLIENT_ID,
        },
        consumer: {
          groupId: environment.KAFKA_CONSUMER_GROUP_ID,
        },
        subscribe: {
          // we want to ensure messages are read eventually even if service is down temporary
          fromBeginning: true,
        },
      },
    },
  );
  app.listen().catch(console.error);
}

bootstrap().catch(console.error);
