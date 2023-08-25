import { Controller, Inject, Logger } from '@nestjs/common';
import {
  ClientKafka,
  Ctx,
  EventPattern,
  KafkaContext,
  Payload,
} from '@nestjs/microservices';

@Controller()
export class WorkerController {
  private readonly logger = new Logger(WorkerController.name);

  constructor(@Inject('KAFKA_CLIENT') private client: ClientKafka) {}

  async onApplicationBootstrap() {
    await this.client.connect();
  }

  @EventPattern('todo.upsert')
  public todoUpsert(
    @Payload() message: string,
    @Ctx() context: KafkaContext,
  ): void {
    this.logger.log('Upsert is called');
    this.logger.log(message);
    this.logger.log(context.getTopic());
    this.client.emit('todo.sync', { sync: true });
  }
}
