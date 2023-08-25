import { Controller, Get, Inject, Logger } from '@nestjs/common';
import { AppService } from './app.service';
import { ClientKafka } from '@nestjs/microservices';
import { timeout } from 'rxjs';
import { environment } from './environment';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject('KAFKA_CLIENT') private client: ClientKafka,
  ) {}

  private readonly logger = new Logger(AppController.name);

  async onApplicationBootstrap() {
    await this.client.connect();

    // Through nest kafka ecosystem, I was not able to receive an event back from the microservice
    // I still may be wrong about this, but I searched a lot and found no way to achieve this with @EventPattern or @MessagePattern
    // Only way I saw data flows microservice -> main service is as message response pattern, but that is not really what we want
    // We do not receive events as response to our events, but as detected changes in third party API
    // For that reason, I am creating kafka client and creating a custom consumer from that
    const consumer = this.client
      .createClient()
      .consumer({ groupId: environment.KAFKA_CONSUMER_GROUP_ID });
    await consumer.subscribe({
      topics: ['todo.sync'],
      // we want to ensure messages are read eventually even if service is down temporary
      fromBeginning: true,
    });
    await consumer.run({
      eachMessage: async ({ message }) => {
        this.logger.log('Sync is called');
        this.logger.log(message.value.toString());
      },
    });
  }

  @Get()
  public async getHello(): Promise<string> {
    this.client.emit('todo.upsert', { test: true }).pipe(timeout(5000));
    return this.appService.getHello();
  }
}
