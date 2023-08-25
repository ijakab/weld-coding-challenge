import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { environment } from '../environment';
import { TodoDispatcher } from './domain/todo.dispatcher';
import { TodoSyncController } from './api/todo-sync.controller';
import { TodoConfig } from './todo-config';
import { TodoHttpController } from './api/todo-http.controller';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: TodoConfig.KafkaDIName,
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
  controllers: [TodoSyncController, TodoHttpController],
  providers: [TodoDispatcher],
})
export class TodoModule {}
