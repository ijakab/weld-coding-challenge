import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class TodoFilterInput {
  @Field(() => Boolean, { nullable: true })
  isCompleted?: boolean | null;

  @Field(() => String, { nullable: true })
  content?: string | null;
}
