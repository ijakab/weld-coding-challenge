import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { environment } from '../../environment';
import { TodoistSyncService } from '../domain/todoist-sync.service';

/* ************

A note: adding nest scheduler is probably the easiest way to run scheduled jobs locally. For production, I would not have the in-memory scheduler.

Firstly, we would need to separate todoist services - one would receive controls and syncing data from main api (from kafka), and that could scale horizontally
This scheduled service would be separate as it cannot scale horizontally as we do not want scheduled job to start multiple times across services
Also, there are better ways to trigger a job in set interval - there are cloud services that can guarantee the delivery of time-triggered events
Additional benefit of that setup is that we can scale cron job workers horizontally if we need to, and have only one instance consume an event at any given time

That process can be simulated locally also with tools such as crontab, however for ease of setup I have gone with nest scheduler.
But that would not be the way to go in real world high load scenario

*/

@Injectable()
export class TodoistSchedulerService {
  private readonly logger = new Logger(TodoistSchedulerService.name);

  constructor(private readonly todoistSyncService: TodoistSyncService) {}

  @Cron(environment.TODOIST_SYNC_INTERVAL)
  async syncTodoist() {
    this.logger.log('Todoist sync crom triggered');
    await this.todoistSyncService.handleTodoistSync();
  }
}
