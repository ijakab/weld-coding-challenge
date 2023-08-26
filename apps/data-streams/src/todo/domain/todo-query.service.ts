import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Todo } from '../data/todo.schema';
import { Model } from 'mongoose';
import { TodoType } from '../api/dto/todo.type';
import { TodoSerializer } from './serialization/todo.serializer';

@Injectable()
export class TodoQueryService {
  constructor(
    @InjectModel(Todo.name) private readonly todoModel: Model<Todo>,
    private readonly todoSerializer: TodoSerializer,
  ) {}

  public async getSingle(id: string): Promise<TodoType> {
    const todo = await this.todoModel.findById(id);
    return this.todoSerializer.single(todo);
  }
}
