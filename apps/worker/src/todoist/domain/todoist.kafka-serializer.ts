import { Injectable } from '@nestjs/common';
import { TodoistItem } from '../data/dto/todoist-item';
import { ExternalTodoDto } from '../../common/api/external-todo.dto';
import { IntegrationEnum } from '../../common/api/integration.enum';

@Injectable()
export class TodoistKafkaSerializer {
  public serializeTodoistItem(item: TodoistItem): string {
    // in a real world we could use something like protobuf or afro to reduce the payload sizes
    return JSON.stringify(this.createCommonInterface(item));
  }

  public createCommonInterface(todoistItem: TodoistItem): ExternalTodoDto {
    return {
      content: todoistItem.content,
      description: todoistItem.description,
      isCompleted: Boolean(todoistItem.completed_at),
      integration: IntegrationEnum.Todoist,
      externalId: todoistItem.id,
      meta: {
        retry: 0,
      },
    };
  }
}
