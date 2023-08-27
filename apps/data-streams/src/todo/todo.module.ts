import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { environment } from '../environment';
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
import { TodoQueryService } from './domain/todo-query.service';
import { TodoSerializer } from './domain/serialization/todo.serializer';
import { CommonModule } from '../common/common.module';
import { TodoSyncFailController } from './api/todo-sync-fail.controller';

@Module({
  imports: [
    CommonModule,
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
  controllers: [TodoSyncController, TodoSyncFailController],
  providers: [
    TodoGraphqlResolver,
    TodoControlService,
    TodoSerializer,
    TodoKafkaSerializer,
    TodoSyncService,
    TodoQueryService,
  ],
})
export class TodoModule {}
