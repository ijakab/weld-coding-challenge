import { Query, Resolver } from '@nestjs/graphql';

@Resolver()
export class TodoGraphqlResolver {
  @Query(() => Boolean)
  public async queryTodos(): Promise<boolean> {
    return true;
  }
}
