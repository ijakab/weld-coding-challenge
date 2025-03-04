import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Todo, TodoDocument, TodoQueryBuilder } from '../data/todo.schema';
import { Model } from 'mongoose';
import { TodoType } from '../api/dto/todo.type';
import { TodoSerializer } from './serialization/todo.serializer';
import { PaginationInput } from '../../common/api/pagination.input';
import { AppConfig } from '../../common/app-config';
import { PaginatedTodoType } from '../api/dto/paginated-todo.type';
import { TodoFilterInput } from '../api/dto/todo-filter.input';
import { NotFoundError } from '../../common/domain/not-found.error';
import { BadRequestError } from '../../common/domain/bad-request.error';

@Injectable()
export class TodoQueryService {
  constructor(
    @InjectModel(Todo.name) private readonly todoModel: Model<Todo>,
    private readonly todoSerializer: TodoSerializer,
  ) {}

  public async queryTodos(
    paginationInput: PaginationInput,
    filterInput?: TodoFilterInput | null,
  ): Promise<PaginatedTodoType> {
    const queryBuilder = this.todoModel.find();
    if (filterInput) this.setFiltersScope(queryBuilder, filterInput);
    const total = await queryBuilder.clone().countDocuments().exec();

    this.setPaginationScope(queryBuilder, paginationInput);
    const paginatedSubset = await queryBuilder.exec();
    const paginatedResponse = this.mapToPaginatedType(paginatedSubset, total);
    return this.todoSerializer.pagination(paginatedResponse);
  }

  public async getSingle(id: string): Promise<TodoType> {
    const todo = await this.todoModel.findById(id);
    if (!todo) throw new NotFoundError('Todo not found', { id });
    return this.todoSerializer.single(todo);
  }

  // In a real world, we'd make some more dynamic filtering as the logic would be reused across modules
  private setFiltersScope(
    query: TodoQueryBuilder,
    filterInput: TodoFilterInput,
  ): void {
    if (typeof filterInput.isCompleted === 'boolean') {
      query.where({ isCompleted: filterInput.isCompleted });
    }
    if (filterInput.content) {
      query.where({
        content: {
          $regex: new RegExp(filterInput.content),
          $options: 'i',
        },
      });
    }
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
      throw new BadRequestError(
        'Cannot send both beforePointer and afterPointer',
      );
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
