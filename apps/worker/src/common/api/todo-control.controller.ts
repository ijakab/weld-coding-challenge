import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { environment } from '../../environment';
import { TodoControlService } from '../domain/todo-control.service';
import { TodoControlDto } from '../../todoist/api/dto/todo-control.dto';

@Controller()
export class TodoControlController {
  private readonly logger = new Logger(TodoControlController.name);

  constructor(private todoControlService: TodoControlService) {}

  @EventPattern(environment.KAFKA_TODO_CONTROL_TOPIC)
  public async receiveControl(
    @Payload() message: TodoControlDto,
  ): Promise<void> {
    this.logger.log('Todo control command received');
    this.logger.debug(message);
    await this.todoControlService.receiveControl(message);
  }
}
