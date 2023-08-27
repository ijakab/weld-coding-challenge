import { Inject, Injectable, Logger } from '@nestjs/common';
import { TodoConfig } from '../../todo/todo-config';
import { ClientKafka } from '@nestjs/microservices';
import { ExternalTodoDto } from '../../todo/api/dto/external-todo.dto';
import { environment } from '../../environment';

@Injectable()
export class KafkaService {
  constructor(
    @Inject(TodoConfig.KafkaDIName) private clientKafka: ClientKafka,
  ) {}

  private readonly logger = new Logger(KafkaService.name);

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

  public async emitFailed(externalTodoDto: ExternalTodoDto, error: string) {
    // Failed messages are those that failed due to error or unavailability within our system
    // We need to retry processing them later
    externalTodoDto.meta.error = error;
    await this.clientKafka.emit(
      environment.KAFKA_TODO_SYNC_FAIL_TOPIC,
      JSON.stringify(externalTodoDto),
    );
  }

  public async emitCorrupt(externalTodoDto: ExternalTodoDto, error: string) {
    // Corrupt messages are messages for which we can be certain failed due to bad format
    // We do need to retry them as we are certain they would fail again
    // We just keep them for reference and debugging
    externalTodoDto.meta.error = error;
    await this.clientKafka.emit(
      environment.KAFKA_TODO_SYNC_CORRUPT_TOPIC,
      JSON.stringify(externalTodoDto),
    );
  }

  public consumerWrapper(original: () => Promise<void>) {
    // we need to handle time out as mongoose can retry queries for too long and kafka consumer may disconnect
    // underlying operation can either fail organically or time out
    // if it fails organically, we want to fail with the original error
    // if it times out, we want to fail with time out error, and later just log the original error
    return new Promise((resolve, reject) => {
      let timedOut = false;
      original()
        .then(resolve)
        .catch((error) => {
          if (timedOut) this.logger.error(error);
          else reject(error);
        });
      setTimeout(() => {
        // after a certain time we want to automatically timeout, because our consumer may disconnect
        timedOut = true;
        this.logger.error('Consumer timed out');
        reject(new Error('Consumer timeout'));
      }, environment.KAFKA_CONSUMER_TIMEOUT);
    });
  }
}
