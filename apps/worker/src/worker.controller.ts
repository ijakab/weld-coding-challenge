import { Controller, Logger } from '@nestjs/common';
import { WorkerService } from './worker.service';
import {
  Ctx,
  KafkaContext,
  MessagePattern,
  Payload,
} from '@nestjs/microservices';

@Controller()
export class WorkerController {
  private readonly logger = new Logger(WorkerController.name);

  constructor(private readonly workerService: WorkerService) {}

  @MessagePattern('kafka.test')
  public getHello(
    @Payload() message: string,
    @Ctx() context: KafkaContext,
  ): void {
    this.logger.log('I am called');
    this.logger.log(message);
    this.logger.log(context.getTopic());
  }
}
