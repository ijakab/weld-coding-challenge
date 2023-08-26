import { Inject, Injectable, Logger } from '@nestjs/common';
import { TodoConfig } from '../todo-config';
import { ClientKafka } from '@nestjs/microservices';
import { TodoControlDto } from '../api/dto/todo-control.dto';
import { environment } from '../../environment';
import { TodoKafkaSerializer } from './serialization/todo.kafka-serializer';

@Injectable()
export class TodoControlService {
  private readonly logger = new Logger(TodoControlService.name);

  constructor(
    @Inject(TodoConfig.KafkaDIName) private readonly clientKafka: ClientKafka,
    private readonly todoKafkaSerializer: TodoKafkaSerializer,
  ) {}

  public async startFetching(): Promise<void> {
    this.logger.log('Sending start fetching signal');
    await this.clientKafka.emit(
      environment.KAFKA_TODO_CONTROL_TOPIC,
      this.todoKafkaSerializer.serializeControl(new TodoControlDto(true)),
    );
  }

  public async stopFetching(): Promise<void> {
    this.logger.log('Sending stop fetching signal');
    await this.clientKafka.emit(
      environment.KAFKA_TODO_CONTROL_TOPIC,
      this.todoKafkaSerializer.serializeControl(new TodoControlDto(false)),
    );
  }
}
