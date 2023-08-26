import { Module } from '@nestjs/common';
import { TodoControlController } from './api/todo-control.controller';
import { TodoControlService } from './domain/todo-control.service';
import { RedisService } from './data/redis.service';

@Module({
  imports: [],
  controllers: [TodoControlController],
  providers: [RedisService, TodoControlService],
  exports: [RedisService],
})
export class CommonModule {}
