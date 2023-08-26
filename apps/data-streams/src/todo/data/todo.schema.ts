import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import type { HydratedDocument, Model } from 'mongoose';

@Schema()
export class Todo {
  @Prop({ required: true })
  content: string;

  @Prop()
  description: string | null;

  @Prop({ required: true })
  isCompleted: boolean;
}

export type TodoDocument = HydratedDocument<Todo>;

// It was hard to type this properly, so I taught of this trick to get the query builder type
export type TodoQueryBuilder = ReturnType<Model<Todo>['find']>;

export const TodoSchema = SchemaFactory.createForClass(Todo);
