import { Injectable, Logger } from '@nestjs/common';
import { TodoistDispatcher } from './todoist.dispatcher';
import { TodoistClient } from '../data/todoist.client';
import { RedisService } from '../../common/data/redis.service';
import { TodoistConfig } from '../todoist-config';
import { TodoControlService } from '../../common/domain/todo-control.service';

@Injectable()
export class TodoistSyncService {
  private readonly logger = new Logger(TodoistSyncService.name);

  constructor(
    private readonly todoistDispatcher: TodoistDispatcher,
    private readonly todoistClient: TodoistClient,
    private readonly redisService: RedisService,
    private readonly todoControlService: TodoControlService,
  ) {}

  public async handleTodoistSync(): Promise<void> {
    const syncEnabled =
      await this.todoControlService.retrieveFetchControlState();
    if (!syncEnabled) return;

    const syncToken = await this.retrieveSyncToken();
    // In a real world we could also have a pagination depending on API, and create stream/observable
    // Todoist sync API does not support pagination
    const todoistResponse = await this.todoistClient.findChanges(syncToken);
    await this.storeSyncToken(todoistResponse.sync_token);

    this.logger.log(`Found ${todoistResponse.items.length} items to sync`);
    if (todoistResponse.items.length) {
      await this.todoistDispatcher.dispatchTodoistChange(todoistResponse.items);
    }
  }

  private async retrieveSyncToken(): Promise<string> {
    const existing = await this.redisService.get(
      TodoistConfig.TodoistSyncTokenKey,
    );

    // todoist api has a concept od sync tokens, a value that tells API when was the last time you did the sync
    // and the api will retrieve changes from that time. Value * means from beginning
    return existing ?? '*';
  }

  private async storeSyncToken(token: string): Promise<void> {
    await this.redisService.set(TodoistConfig.TodoistSyncTokenKey, token);
  }
}
