import { Injectable } from '@nestjs/common';
import { ExternalTodoDto } from '../api/dto/external-todo.dto';
import { Model } from 'mongoose';
import { Todo, TodoDocument } from '../data/todo.schema';
import { TodoIntegration } from '../data/todo-integration.schema';
import { InjectModel } from '@nestjs/mongoose';

// My IDE reports some errors here, but they are not type errors and typescript does not detect anything
// I am assuming that it reads some mongoose typing incorrectly, hopefully it will not be problem for others
@Injectable()
export class TodoSyncService {
  constructor(
    @InjectModel(Todo.name) private readonly todoModel: Model<Todo>,
    @InjectModel(TodoIntegration.name)
    private readonly todoIntegrationModel: Model<TodoIntegration>,
  ) {}

  public async syncExternalTodo(externalTodo: ExternalTodoDto): Promise<void> {
    const existingIntegration = await this.todoIntegrationModel.findOne({
      integration: externalTodo.integration,
      externalId: externalTodo.externalId,
    });

    if (existingIntegration) {
      const todo = await this.todoModel.findById(existingIntegration.todo);
      await this.updateExisting(todo, externalTodo);
    } else {
      await this.createTodoWithIntegration(externalTodo);
    }
  }

  private async updateExisting(
    existing: TodoDocument,
    incoming: ExternalTodoDto,
  ): Promise<void> {
    if (!this.hasChanges(existing, incoming)) return;
    // data can come out of order, especially if we have multiple integrations and in case of retries
    // we want to make sure we do not override if we have newer version
    if (existing.syncAt && existing.syncAt > incoming.meta.syncAt) return;

    existing.content = incoming.content;
    existing.description = incoming.description;
    existing.isCompleted = incoming.isCompleted;
    existing.syncAt = incoming.meta.syncAt;
    await existing.save();
  }

  private hasChanges(todo: TodoDocument, incoming: ExternalTodoDto) {
    const scanKeys: Array<keyof ExternalTodoDto> = [
      'content',
      'description',
      'isCompleted',
    ];
    for (const key of scanKeys) {
      if (todo[key] !== incoming[key]) return true;
    }
    return false;
  }

  private async createTodoWithIntegration(
    incoming: ExternalTodoDto,
  ): Promise<void> {
    const todo = await this.todoModel.create({
      content: incoming.content,
      description: incoming.description,
      isCompleted: incoming.isCompleted,
      syncAt: incoming.meta.syncAt,
    });
    await this.todoIntegrationModel.create({
      integration: incoming.integration,
      externalId: incoming.externalId,
      todo: todo.id,
    });
  }
}
