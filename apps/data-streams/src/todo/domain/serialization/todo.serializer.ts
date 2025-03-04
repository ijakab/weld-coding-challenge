import { BaseSerializer } from '../../../common/domain/base.serializer';
import { Todo, TodoDocument } from '../../data/todo.schema';
import { TodoType } from '../../api/dto/todo.type';
import { Injectable } from '@nestjs/common';

@Injectable()
export class TodoSerializer extends BaseSerializer<
  TodoDocument | Todo,
  TodoType
> {
  protected serialize(item: TodoDocument): TodoType {
    return {
      id: item.id,
      content: item.content,
      description: item.description,
      isCompleted: item.isCompleted,
    };
  }
}
