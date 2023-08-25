import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { TodoConfig } from '../todo-config';
import { environment } from '../../environment';

@Injectable()
export class TodoDispatcher implements OnApplicationBootstrap {
  private readonly logger = new Logger(TodoDispatcher.name);

  constructor(@Inject(TodoConfig.KafkaDIName) private client: ClientKafka) {}

  public async onApplicationBootstrap() {
    await this.client.connect();
  }

  public async dispatchTodo(): Promise<void> {
    await this.client.emit(environment.KAFKA_TODO_UPSERT_TOPIC, {
      upsert: true,
    });
  }
}
