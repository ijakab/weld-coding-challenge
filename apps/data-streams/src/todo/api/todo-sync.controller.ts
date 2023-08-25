import {
  Controller,
  Inject,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { TodoConfig } from '../todo-config';
import { environment } from '../../environment';

@Controller()
export class TodoSyncController implements OnApplicationBootstrap {
  private readonly logger = new Logger(TodoSyncController.name);

  constructor(@Inject(TodoConfig.KafkaDIName) private client: ClientKafka) {}

  public async onApplicationBootstrap(): Promise<void> {
    // Through nest kafka ecosystem, I was not able to receive an event back from the microservice
    // I still may be wrong about this, but I searched a lot and found no way to achieve this with @EventPattern or @MessagePattern
    // Only way I saw data flows microservice -> main service is as message response pattern, but that is not really what we want
    // We do not receive events as response to our events, but as detected changes in third party API
    // For that reason, I am creating kafka client and creating a custom consumer from that
    const consumer = this.client
      .createClient()
      .consumer({ groupId: environment.KAFKA_CONSUMER_GROUP_ID });
    await consumer.subscribe({
      topics: [environment.KAFKA_TODO_SYNC_TOPIC],
      // we want to ensure messages are read eventually even if service is down temporary
      fromBeginning: true,
    });
    await consumer.run({
      eachMessage: async ({}) => {
        this.syncTodo();
      },
    });
  }

  public syncTodo(): void {
    this.logger.log('Sync is called');
  }
}
