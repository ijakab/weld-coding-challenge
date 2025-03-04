import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Todo, TodoDocument } from '../../data/todo.schema';
import { Model } from 'mongoose';
import { TodoIntegration } from '../../data/todo-integration.schema';
import { IntegrationEnum } from '../../api/dto/integration.enum';

// primarily helps in writing tests
@Injectable()
export class TodoTestMutationService {
  constructor(
    @InjectModel(Todo.name) private readonly todoModel: Model<Todo>,
    @InjectModel(TodoIntegration.name)
    private readonly todoIntegrationModel: Model<TodoIntegration>,
  ) {}

  public async deleteAll(): Promise<void> {
    await this.todoIntegrationModel.deleteMany().exec();
    await this.todoModel.deleteMany().exec();
  }

  public async seedForQuery(): Promise<void> {
    for (let i = 5; i > 0; i--) {
      await this.todoModel.create({
        content: `Testing todo #${i}`,
        syncAt: Date.now(),
        description: null,
        isCompleted: false,
      });
    }
  }

  public async seedForSync(externalId: string): Promise<TodoDocument> {
    const todoWithIntegration = await this.todoModel.create({
      content: 'Todo with integration',
      syncAt: Date.now(),
      description: null,
      isCompleted: true,
    });
    await this.todoIntegrationModel.create({
      integration: IntegrationEnum.Todoist,
      externalId,
      todo: todoWithIntegration.id,
    });
    return todoWithIntegration;
  }
}
