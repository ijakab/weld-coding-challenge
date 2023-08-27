import { Test } from '@nestjs/testing';
import { TodoistClient } from '../../data/todoist.client';
import {
  mockedTodoItems,
  TodoistMockClient,
} from '../../data/todoist.mock-client';
import { TodoistSyncService } from '../todoist-sync.service';
import { TodoistConfig } from '../../todoist-config';
import { environment } from '../../../environment';
import { TodoControlService } from '../../../common/domain/todo-control.service';
import { TodoControlDto } from '../../api/dto/todo-control.dto';
import { WorkerModule } from '../../../worker.module';
import { ClientKafkaMock } from './client-kafka-mock';

describe('TodoistSyncService', () => {
  let syncService: TodoistSyncService;
  let todoControlService: TodoControlService;
  let clientKafkaMock: ClientKafkaMock;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [WorkerModule],
    })
      .overrideProvider(TodoistClient)
      .useValue(new TodoistMockClient())
      .overrideProvider(TodoistConfig.KafkaDIName)
      .useValue(new ClientKafkaMock())
      .compile();
    await module.createNestApplication().init();

    syncService = module.get(TodoistSyncService);
    todoControlService = module.get(TodoControlService);
    clientKafkaMock = module.get(TodoistConfig.KafkaDIName);
  });

  test('Should not consume API if fetch control state is off', async () => {
    await todoControlService.receiveControl(new TodoControlDto(false));

    await syncService.handleTodoistSync();
    await syncService.handleTodoistSync();
    await syncService.handleTodoistSync();

    expect(clientKafkaMock.getJestMock().calls).toHaveLength(0);
  });

  test('Should push message to kafka', async () => {
    await todoControlService.receiveControl(new TodoControlDto(true));

    await syncService.handleTodoistSync();

    expect(clientKafkaMock.getJestMock().calls).toHaveLength(2);

    const results = clientKafkaMock.getJestMock().results;

    const topics = results.map((result) => result.value.topic);
    const data = results.map((result) => result.value.data);

    expect(topics).toStrictEqual([
      environment.KAFKA_TODO_SYNC_TOPIC,
      environment.KAFKA_TODO_SYNC_TOPIC,
    ]);
    expect(data[0].key).toBe(mockedTodoItems[0].id);
    expect(data[1].key).toBe(mockedTodoItems[1].id);
  });
});
