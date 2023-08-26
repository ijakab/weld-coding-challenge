import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

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

export const TodoSchema = SchemaFactory.createForClass(Todo);
