import { Injectable } from '@nestjs/common';
import { TodoControlDto } from '../../api/dto/todo-control.dto';

@Injectable()
export class TodoKafkaSerializer {
  serializeControl(control: TodoControlDto): string {
    return JSON.stringify(control);
  }
}
