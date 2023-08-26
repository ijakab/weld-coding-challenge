import { Injectable } from '@nestjs/common';
import { TodoistDispatcher } from './todoist.dispatcher';
import { TodoistClient } from '../data/todoist.client';

@Injectable()
export class TodoistSyncService {
  constructor(
    private readonly todoistDispatcher: TodoistDispatcher,
    private readonly todoistClient: TodoistClient,
  ) {}

  public async handleTodoistSync(): Promise<void> {
    const todoistItems = await this.todoistClient.findChanges();
    console.log(todoistItems);
  }
}
