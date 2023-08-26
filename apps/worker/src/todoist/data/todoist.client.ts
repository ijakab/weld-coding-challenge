import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { TodoistItem } from './dto/todoist-item';
import { environment } from '../../environment';

@Injectable()
export class TodoistClient {
  constructor(private readonly httpService: HttpService) {}

  public findChanges(): Promise<AxiosResponse<{ items: TodoistItem[] }>> {
    return firstValueFrom(
      this.httpService.post(
        'https://api.todoist.com/sync/v9/sync',
        'sync_token=*&resource_types=["items"]',
        {
          headers: {
            Authorization: `Bearer ${environment.TODOIST_BEARER_TOKEN}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      ),
    );
  }
}
