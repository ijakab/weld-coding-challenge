import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PaginationType {
  @Field(() => Int)
  total: number;

  @Field(() => String, { nullable: true })
  firstPointer?: string | null;

  @Field(() => String, { nullable: true })
  lastPointer?: string | null;

  // In a real world, we would also want hasNext hasPrev etc..
}

export interface ModulePaginationType<ModuleType> {
  pagination: PaginationType;
  records: ModuleType[];
}
