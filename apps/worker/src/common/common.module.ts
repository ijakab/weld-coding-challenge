import { Module } from '@nestjs/common';
import { TodoistModule } from '../todoist/todoist.module';
import { TodoControlController } from './api/todo-control.controller';
import { TodoControlService } from './domain/todo-control.service';
import { RedisService } from './data/redis.service';

@Module({
  imports: [TodoistModule],
  controllers: [TodoControlController],
  providers: [RedisService, TodoControlService],
  exports: [RedisService],
})
export class CommonModule {}
