import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { environment } from '../environment';
import { TodoistConfig } from './todoist-config';
import { TodoUpsertController } from './api/todo-upsert.controller';
import { TodoistDispatcher } from './domain/todoist.dispatcher';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: TodoistConfig.KafkaDIName,
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: environment.KAFKA_CLIENT_ID,
            brokers: environment.KAFKA_BROKERS.split(','),
          },
        },
      },
    ]),
  ],
  controllers: [TodoUpsertController],
  providers: [TodoistDispatcher],
})
export class TodoistModule {}
