import { Field, ObjectType } from '@nestjs/graphql';
import { PaginationType } from '../../../common/api/pagination.type';
import { TodoType } from './todo.type';

@ObjectType()
export class PaginatedTodoType {
  @Field(() => PaginationType)
  pagination: PaginationType;

  @Field(() => [TodoType])
  records: TodoType[];
}
