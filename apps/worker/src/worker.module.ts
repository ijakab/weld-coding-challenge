import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { TodoistModule } from './todoist/todoist.module';

@Module({
  imports: [CommonModule, TodoistModule],
})
export class WorkerModule {}
