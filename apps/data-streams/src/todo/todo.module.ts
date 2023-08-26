import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { environment } from '../environment';
import { TodoDispatcher } from './domain/todo.dispatcher';
import { TodoSyncController } from './api/todo-sync.controller';
import { TodoConfig } from './todo-config';
import { TodoControlService } from './domain/todo-control.service';
import { TodoGraphqlResolver } from './api/todo-graphql.resolver';
import { TodoKafkaSerializer } from './domain/serialization/todo.kafka-serializer';
import { MongooseModule } from '@nestjs/mongoose';
import { Todo, TodoSchema } from './data/todo.schema';
import {
  TodoIntegration,
  TodoIntegrationSchema,
} from './data/todo-integration.schema';
import { TodoSyncService } from './domain/todo-sync.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Todo.name, schema: TodoSchema },
      { name: TodoIntegration.name, schema: TodoIntegrationSchema },
    ]),
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
  controllers: [TodoSyncController],
  providers: [
    TodoDispatcher,
    TodoGraphqlResolver,
    TodoControlService,
    TodoKafkaSerializer,
    TodoSyncService,
  ],
})
export class TodoModule {}
