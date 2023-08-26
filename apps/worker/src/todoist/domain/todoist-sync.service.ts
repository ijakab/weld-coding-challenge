import { Injectable } from '@nestjs/common';
import { TodoistDispatcher } from './todoist.dispatcher';
import { TodoistClient } from '../data/todoist.client';
import { RedisService } from '../../common/data/redis.service';
import { TodoistConfig } from '../todoist-config';

@Injectable()
export class TodoistSyncService {
  constructor(
    private readonly todoistDispatcher: TodoistDispatcher,
    private readonly todoistClient: TodoistClient,
    private readonly redisService: RedisService,
  ) {}

  public async handleTodoistSync(): Promise<void> {
    const syncToken = await this.retrieveSyncToken();
    const todoistItems = await this.todoistClient.findChanges(syncToken);
    await this.storeSyncToken(todoistItems.sync_token);
    console.log(todoistItems);
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
