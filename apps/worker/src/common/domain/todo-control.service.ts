import { Injectable } from '@nestjs/common';
import { TodoControlDto } from '../../todoist/api/dto/todo-control.dto';
import { RedisService } from '../data/redis.service';
import { CommonConfig } from '../common.config';

@Injectable()
export class TodoControlService {
  constructor(private readonly redisService: RedisService) {}

  // Using redis for this would be something discussed in a real world
  // On one hand, it allows distributed workload, and all instances of worker can read this state
  // On the other hand, it may add additional hosting cost for this simple case
  // But for the showcase I went with redis
  public async receiveControl(control: TodoControlDto) {
    // Couple of improvements possible here for a real world: add serializers/deserializers for redis, validating incoming dto
    // But for this simple case I opted out of this to save some time
    await this.redisService.set(
      CommonConfig.TodoControlFetchKey,
      control.fetch.toString(),
    );
  }

  public async retrieveFetchControlState(): Promise<boolean> {
    const existingControl = await this.redisService.get(
      CommonConfig.TodoControlFetchKey,
    );
    if (!existingControl) return false;
    // we could also handle what if value is not one of the expected 'true' or 'false'
    return existingControl === 'true';
  }
}
