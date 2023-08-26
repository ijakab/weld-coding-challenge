import { Mutation, Query, Resolver } from '@nestjs/graphql';
import { TodoControlService } from '../domain/todo-control.service';

@Resolver()
export class TodoGraphqlResolver {
  constructor(private readonly todoControlService: TodoControlService) {}

  @Query(() => Boolean)
  public async queryTodos(): Promise<boolean> {
    return true;
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
