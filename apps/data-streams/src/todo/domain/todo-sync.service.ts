import { Injectable } from '@nestjs/common';
import { ExternalTodoDto } from '../api/dto/external-todo.dto';

@Injectable()
export class TodoSyncService {
  syncExternalTodo(data: ExternalTodoDto) {
    console.log(data);
  }
}
