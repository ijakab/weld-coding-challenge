import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class PaginationInput {
  @Field(() => Int)
  limit: number;

  @Field(() => String, { nullable: true })
  beforePointer?: string | null;

  @Field(() => String, { nullable: true })
  afterPointer?: string | null;
}
