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
    // while implementing this method I was in a dilemma weather it is better to batch all the items in a single message or to have one message for one item
    // batching may be more performant, but I have a couple of reasons for going with this approach in this case
    // first, kafka statistics, such as consumer lag, would give us a better insight into how much work our service is behind if every message is equal
    // second, there would be a real doubt weather to commit offset for a message if processing failed for some items and succeeded for others
    // lastly, I wanted to have item.id as a message key, as it is important to consume messages for a single item in order
    // whereas across items messages can be consumed out of order to gain some performance

    for (const item of items) {
      const serialized = this.todoistKafkaSerializer.serializeTodoistItem(item);
      this.client.emit(environment.KAFKA_TODO_SYNC_TOPIC, {
        key: item.id,
        value: serialized,
      });
    }
  }
}
