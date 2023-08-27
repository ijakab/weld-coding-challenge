import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { environment } from '../environment';
import { TodoistConfig } from './todoist-config';
import { TodoistClient } from './data/todoist.client';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { TodoistSchedulerService } from './api/todoist-scheduler.service';
import { TodoistDispatcher } from './domain/todoist.dispatcher';
import { TodoistSyncService } from './domain/todoist-sync.service';
import { CommonModule } from '../common/common.module';
import { TodoistKafkaSerializer } from './domain/todoist.kafka-serializer';

@Module({
  imports: [
    CommonModule,
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
    HttpModule.register({
      timeout: TodoistConfig.HttpTimeout,
      maxRedirects: TodoistConfig.HttpMaxRedirects,
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [],
  providers: [
    TodoistSchedulerService,
    TodoistDispatcher,
    TodoistClient,
    TodoistSyncService,
    TodoistKafkaSerializer,
  ],
})
export class TodoistModule {}
