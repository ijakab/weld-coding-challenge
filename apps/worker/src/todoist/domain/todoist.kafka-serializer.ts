import { Injectable } from '@nestjs/common';
import { TodoistItem } from '../data/dto/todoist-item';

@Injectable()
export class TodoistKafkaSerializer {
  serializeTodoistItems(items: TodoistItem[]): string {
    // in a real world we could use something like protobuf or afro to reduce the payload sizes
    return JSON.stringify(
      items.map((item) => {
        return {
          id: item.id,
          content: item.content,
          description: item.description,
          completed_at: item.completed_at,
        };
      }),
    );
  }
}
