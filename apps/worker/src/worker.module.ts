import { Module } from '@nestjs/common';
import { TodoistModule } from './todoist/todoist.module';

@Module({
  imports: [TodoistModule],
  controllers: [],
  providers: [],
})
export class WorkerModule {}
