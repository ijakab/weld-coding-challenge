import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { TodoControlService } from '../domain/todo-control.service';
import { TodoType } from './dto/todo.type';
import { TodoQueryService } from '../domain/todo-query.service';
import { PaginationInput } from '../../common/api/pagination.input';
import { PaginatedTodoType } from './dto/paginated-todo.type';
import { TodoFilterInput } from './dto/todo-filter.input';

@Resolver()
export class TodoGraphqlResolver {
  constructor(
    private readonly todoControlService: TodoControlService,
    private readonly todoQueryService: TodoQueryService,
  ) {}

  @Query(() => PaginatedTodoType)
  public async queryTodos(
    @Args({ name: 'pagination', type: () => PaginationInput })
    pagination: PaginationInput,
    @Args({ name: 'filters', type: () => TodoFilterInput, nullable: true })
    filters?: TodoFilterInput | null,
  ): Promise<PaginatedTodoType> {
    return this.todoQueryService.queryTodos(pagination, filters);
  }

  @Query(() => TodoType)
  public async singleTodo(
    @Args({ name: 'id', type: () => String }) id: string,
  ): Promise<TodoType> {
    return this.todoQueryService.getSingle(id);
  }

  @Mutation(() => Boolean)
  public async startFetching(): Promise<boolean> {
    await this.todoControlService.startFetching();
    return true;
  }

  @Mutation(() => Boolean)
  public async stopFetching(): Promise<boolean> {
    await this.todoControlService.stopFetching();
    return false;
  }
}
