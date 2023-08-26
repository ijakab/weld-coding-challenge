import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { TodoIntegration } from './todo-integration.schema';
import * as mongoose from 'mongoose';

@Schema()
export class Todo {
  @Prop({ required: true })
  content: string;

  @Prop()
  description: string | null;

  @Prop({ required: true })
  isCompleted: boolean;

  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TodoIntegration' }],
  })
  integrations: TodoIntegration[];
}

export type TodoDocument = HydratedDocument<Todo>;

export const TodoSchema = SchemaFactory.createForClass(Todo);
