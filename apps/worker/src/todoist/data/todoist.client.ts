import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environment';
import { TodoistSyncResponse } from './dto/todoist-sync-response';

@Injectable()
export class TodoistClient {
  constructor(private readonly httpService: HttpService) {}

  public async findChanges(syncToken: string): Promise<TodoistSyncResponse> {
    const response = await firstValueFrom(
      this.httpService.post(
        'https://api.todoist.com/sync/v9/sync',
        `sync_token=${syncToken}&resource_types=["items"]`,
        {
          headers: {
            Authorization: `Bearer ${environment.TODOIST_BEARER_TOKEN}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      ),
    );
    return response.data;
  }
}
