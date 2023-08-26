import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import * as mongoose from 'mongoose';
import { Todo } from './todo.schema';
import { IntegrationEnum } from '../api/dto/integration.enum';

// Weather to split integrations collection from the main collection can be a subject of discussion
// I feel that in the real world splitting would allow easier growth, e.g. if we want to add integrations with additional APIs
// In a way that multiple teams handling their integration could own their data if we make some additional changes
// But of course, that is far from this, and depending on where we grow could be unnecessary

@Schema()
export class TodoIntegration {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Todo', required: true })
  todo: Todo;

  @Prop({ required: true })
  externalId: string;

  @Prop({ type: String, enum: Object.values(IntegrationEnum), requited: true })
  integration: IntegrationEnum;
}

export type TodoIntegrationDocument = HydratedDocument<TodoIntegration>;

export const TodoIntegrationSchema =
  SchemaFactory.createForClass(TodoIntegration);
