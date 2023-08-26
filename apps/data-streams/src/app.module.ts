import { Module } from '@nestjs/common';
import { CommonModule } from './common/common.module';
import { TodoModule } from './todo/todo.module';

@Module({
  imports: [CommonModule, TodoModule],
})
export class AppModule {}
