import { Controller, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { environment } from '../../environment';
import { TodoSyncService } from '../domain/todo-sync.service';
import { ExternalTodoDto } from './dto/external-todo.dto';
import { KafkaService } from '../../common/api/kafka.service';
import { BadRequestError } from '../../common/domain/bad-request.error';

@Controller()
export class TodoSyncController implements OnApplicationBootstrap {
  private readonly logger = new Logger(TodoSyncController.name);

  constructor(
    private kafkaService: KafkaService,
    private todoSyncService: TodoSyncService,
  ) {}

  public async onApplicationBootstrap(): Promise<void> {
    await this.kafkaService.createConsumer(
      environment.KAFKA_TODO_SYNC_TOPIC,
      environment.KAFKA_CONSUMER_SYNC_GROUP_ID,
      (externalTodo: ExternalTodoDto, commitOffset: () => Promise<void>) => {
        return this.syncTodo(externalTodo, commitOffset);
      },
    );
  }

  public async syncTodo(
    externalTodo: ExternalTodoDto,
    commitOffset: () => Promise<void>,
  ): Promise<void> {
    this.logger.log('Called todo sync request');

    // We do not want to block entire pipeline if a message fails. Instead, we continue to consume messages and push to failed messages pipeline
    try {
      await this.kafkaService.consumerWrapper(async () => {
        await this.todoSyncService.syncExternalTodo(externalTodo);
      });
    } catch (error) {
      if (error instanceof BadRequestError) {
        await this.kafkaService.emitCorrupt(externalTodo, error.message);
      } else {
        await this.kafkaService.emitFailed(externalTodo, error.message);
      }
    }

    await commitOffset();
  }
}
