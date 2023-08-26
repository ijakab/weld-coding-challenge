import { Injectable } from '@nestjs/common';
import { TodoControlDto } from '../../todoist/api/dto/todo-control.dto';

@Injectable()
export class TodoControlService {
  constructor() {}

  public async receiveControl(control: TodoControlDto) {
    console.log('Service', control);
  }
}
