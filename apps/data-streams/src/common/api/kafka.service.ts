import { Inject, Injectable } from '@nestjs/common';
import { TodoConfig } from '../../todo/todo-config';
import { ClientKafka } from '@nestjs/microservices';
import { ExternalTodoDto } from '../../todo/api/dto/external-todo.dto';

@Injectable()
export class KafkaService {
  constructor(
    @Inject(TodoConfig.KafkaDIName) private clientKafka: ClientKafka,
  ) {}

  // Through nest kafka ecosystem, I was not able to receive an event back from the microservice - only from main service to microservice
  // I still may be wrong about this, but I searched a lot and found no way to achieve this with @EventPattern or @MessagePattern
  // Only way I saw data flows microservice -> main service is as message response pattern, but that is not really what we want
  // We do not receive events as response to our events, but as detected changes in third party API
  // For that reason, I am creating kafka client and creating a custom consumer from that
  public async createConsumer(
    topic: string,
    consumerGroupId: string,
    callback: (
      payload: ExternalTodoDto,
      commitOffset: () => Promise<void>,
    ) => Promise<void>,
  ): Promise<void> {
    const consumer = this.clientKafka
      .createClient()
      .consumer({ groupId: consumerGroupId });
    await consumer.subscribe({
      autoCommit: false,
      topics: [topic],
      // we want to ensure messages are read eventually even if service is down temporary
      fromBeginning: true,
    });
    await consumer.run({
      eachMessage: async ({ message, topic, partition }) => {
        const commitOffset = () => {
          return consumer.commitOffsets([
            {
              topic,
              partition,
              offset: (Number(message.offset) + 1).toString(),
            },
          ]);
        };
        // this JSON parsing is pretty much what I assume nest's @Payload would do so wanted to emulate its
        await callback(JSON.parse(message.value.toString()), commitOffset);
      },
    });
  }

  public async emit(topic: string, data: string) {
    await this.clientKafka.emit(topic, data);
  }
}
