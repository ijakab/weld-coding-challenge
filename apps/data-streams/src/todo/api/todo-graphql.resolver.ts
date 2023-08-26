import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { TodoControlService } from '../domain/todo-control.service';
import { TodoType } from './dto/todo.type';
import { TodoQueryService } from '../domain/todo-query.service';

@Resolver()
export class TodoGraphqlResolver {
  constructor(
    private readonly todoControlService: TodoControlService,
    private readonly todoQueryService: TodoQueryService,
  ) {}

  @Query(() => Boolean)
  public async queryTodos(): Promise<boolean> {
    return true;
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
