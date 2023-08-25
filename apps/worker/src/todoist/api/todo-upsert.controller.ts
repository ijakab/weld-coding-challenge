import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { environment } from '../../environment';
import { TodoistDispatcher } from '../domain/todoist.dispatcher';

@Controller()
export class TodoUpsertController {
  private readonly logger = new Logger(TodoUpsertController.name);

  constructor(private todoistDispatcher: TodoistDispatcher) {}

  @EventPattern(environment.KAFKA_TODO_UPSERT_TOPIC)
  public async todoUpsert(@Payload() message: string): Promise<void> {
    this.logger.log('Upsert is called');
    this.logger.log(message);
    await this.todoistDispatcher.dispatchTodoistChange();
  }
}
