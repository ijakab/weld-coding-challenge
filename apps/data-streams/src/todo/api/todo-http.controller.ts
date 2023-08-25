import { Controller, Get } from '@nestjs/common';
import { TodoDispatcher } from '../domain/todo.dispatcher';

@Controller('/todo')
export class TodoHttpController {
  constructor(private readonly todoDispatcher: TodoDispatcher) {}
  @Get()
  public async dummy() {
    await this.todoDispatcher.dispatchTodo();
    return 'dummy';
  }
}
