import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Todo, TodoDocument, TodoQueryBuilder } from '../data/todo.schema';
import { Model } from 'mongoose';
import { TodoType } from '../api/dto/todo.type';
import { TodoSerializer } from './serialization/todo.serializer';
import { PaginationInput } from '../../common/api/pagination.input';
import { AppConfig } from '../../common/app-config';
import { PaginatedTodoType } from '../api/dto/paginated-todo.type';

@Injectable()
export class TodoQueryService {
  constructor(
    @InjectModel(Todo.name) private readonly todoModel: Model<Todo>,
    private readonly todoSerializer: TodoSerializer,
  ) {}

  public async queryTodos(
    paginationInput: PaginationInput,
  ): Promise<PaginatedTodoType> {
    const queryBuilder = this.todoModel.find();
    const total = await queryBuilder.clone().countDocuments().exec();

    this.setPaginationScope(queryBuilder, paginationInput);
    const paginatedSubset = await queryBuilder.exec();
    const paginatedResponse = this.mapToPaginatedType(paginatedSubset, total);
    return this.todoSerializer.pagination(paginatedResponse);
  }

  public async getSingle(id: string): Promise<TodoType> {
    const todo = await this.todoModel.findById(id);
    return this.todoSerializer.single(todo);
  }

  // for better performance on large datasets we use cursor based pagination
  // sort order cannot be changed in that case.
  // in a real world of course, such decision would be considered by product owners
  private setPaginationScope(
    query: TodoQueryBuilder,
    paginationInput: PaginationInput,
  ): void {
    // in a real world, we'd probably reuse pagination across modules so we'd write this more generically
    const take = Math.min(paginationInput.limit, AppConfig.MaximumPageSize);
    query.limit(take);
    query.sort('-_id');
    if (paginationInput.afterPointer && paginationInput.beforePointer) {
      // todo throw error later
    }
    if (paginationInput.afterPointer) {
      query.where({ _id: { $lt: paginationInput.afterPointer } });
    }
    if (paginationInput.beforePointer) {
      query.where({ _id: { $gt: paginationInput.beforePointer } });
    }
  }

  private mapToPaginatedType(records: TodoDocument[], total: number) {
    const firstPointer = records.length ? records[0].id : null;
    const lastPointer = records.length ? records[records.length - 1].id : null;
    return {
      pagination: {
        total,
        firstPointer,
        lastPointer,
      },
      records,
    };
  }
}
