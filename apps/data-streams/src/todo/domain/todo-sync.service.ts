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
    // Here, I would also like to do something like
    // if (existingIntegration.todo.updatedAt > externalTodo.updatedAt) return
    // So that we make sure we do not update if we already have the newer record, or otherwise set some policy for situations like those
    // Because we could get data out of order if integrating with multiple APIs.
    // However, todoist does not provide information about last update so I did not go with that approach

    existing.content = incoming.content;
    existing.description = incoming.description;
    existing.isCompleted = incoming.isCompleted;
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
    });
    await this.todoIntegrationModel.create({
      integration: incoming.integration,
      externalId: incoming.externalId,
      todo: todo.id,
    });
  }
}
