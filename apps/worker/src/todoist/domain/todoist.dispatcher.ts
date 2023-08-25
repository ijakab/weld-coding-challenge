import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { TodoistConfig } from '../todoist-config';
import { environment } from '../../environment';

@Injectable()
export class TodoistDispatcher implements OnApplicationBootstrap {
  constructor(@Inject(TodoistConfig.KafkaDIName) private client: ClientKafka) {}

  public async onApplicationBootstrap(): Promise<void> {
    await this.client.connect();
  }

  public async dispatchTodoistChange(): Promise<void> {
    this.client.emit(environment.KAFKA_TODO_SYNC_TOPIC, { sync: true });
  }
}
