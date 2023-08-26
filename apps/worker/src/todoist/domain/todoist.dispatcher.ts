import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { TodoistConfig } from '../todoist-config';
import { environment } from '../../environment';
import { TodoistItem } from '../data/dto/todoist-item';
import { TodoistKafkaSerializer } from './todoist.kafka-serializer';

@Injectable()
export class TodoistDispatcher implements OnApplicationBootstrap {
  constructor(
    @Inject(TodoistConfig.KafkaDIName) private client: ClientKafka,
    private readonly todoistKafkaSerializer: TodoistKafkaSerializer,
  ) {}

  public async onApplicationBootstrap(): Promise<void> {
    await this.client.connect();
  }

  public async dispatchTodoistChange(items: TodoistItem[]): Promise<void> {
    const serialized = this.todoistKafkaSerializer.serializeTodoistItems(items);
    this.client.emit(environment.KAFKA_TODO_SYNC_TOPIC, serialized);
  }
}
