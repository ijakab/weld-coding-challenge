import { Field, ObjectType } from '@nestjs/graphql';

// this is technically strictly graphql type, however its type definition can be used more generally
@ObjectType()
export class TodoType {
  @Field(() => String)
  id: string;

  @Field(() => String)
  content: string;

  @Field(() => String, { nullable: true })
  description?: string | null;

  @Field(() => Boolean)
  isCompleted: boolean;
}
