import { Module } from '@nestjs/common';
import { TodoistModule } from '../todoist/todoist.module';
import { TodoControlController } from './api/todo-control.controller';
import { TodoControlService } from './domain/todo-control.service';

@Module({
  imports: [TodoistModule],
  controllers: [TodoControlController],
  providers: [TodoControlService],
})
export class WorkerModule {}
