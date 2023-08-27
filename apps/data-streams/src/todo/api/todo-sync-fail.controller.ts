import { Controller, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { environment } from '../../environment';
import { TodoSyncService } from '../domain/todo-sync.service';
import { ExternalTodoDto } from './dto/external-todo.dto';
import { KafkaService } from '../../common/api/kafka.service';

@Controller()
export class TodoSyncFailController implements OnApplicationBootstrap {
  private readonly logger = new Logger(TodoSyncFailController.name);

  constructor(
    private kafkaService: KafkaService,
    private todoSyncService: TodoSyncService,
  ) {}

  public async onApplicationBootstrap(): Promise<void> {
    // If we know that we have some error causing processing to fail, we may want to turn this pipeline off
    // So that messages are not consumed if we know they are going to fail
    // Even better, in production we could consume failed messages on the separate service, so that main one is not overwhelmed
    if (environment.KAFKA_RUN_FAIL_CONSUMER) {
      await this.kafkaService.createConsumer(
        environment.KAFKA_TODO_SYNC_FAIL_TOPIC,
        environment.KAFKA_CONSUMER_FAIL_GROUP_ID,
        (externalTodo: ExternalTodoDto, commitOffset: () => Promise<void>) => {
          return this.syncTodo(externalTodo, commitOffset);
        },
      );
    }
  }

  public async syncTodo(
    externalTodo: ExternalTodoDto,
    commitOffset: () => Promise<void>,
  ): Promise<void> {
    // for error handling here, I decided it should be able to retry indefinitely so that no data is lost
    // of course, in the real world we'd need to discuss how we want to handle these cases
    this.logger.log('Called todo sync failed request');
    await this.kafkaService.consumerWrapper(async () => {
      await this.todoSyncService.syncExternalTodo(externalTodo);
    });

    await commitOffset();
  }
}
