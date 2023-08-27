import { TodoQueryService } from '../todo-query.service';
import { Test } from '@nestjs/testing';
import { TodoModule } from '../../todo.module';
import { TodoTestMutationService } from './todo-test-mutation.service';
import { TodoSyncService } from '../todo-sync.service';
import { TodoDocument } from '../../data/todo.schema';
import { IntegrationEnum } from '../../api/dto/integration.enum';

describe('TodoQueryService', () => {
  let mutationService: TodoTestMutationService;
  let syncService: TodoSyncService;
  let queryService: TodoQueryService;
  let seededTodo: TodoDocument;
  const externalId = '12345';

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [TodoModule],
    }).compile();
    queryService = module.get(TodoQueryService);
    syncService = module.get(TodoSyncService);
    mutationService = module.get(TodoTestMutationService);

    await mutationService.deleteAll();
    seededTodo = await mutationService.seedForSync(externalId);
  });

  it('Should not sync if newer version exists', async () => {
    await syncService.syncExternalTodo({
      content: 'Updated content',
      description: null,
      isCompleted: false,
      externalId,
      integration: IntegrationEnum.Todoist,
      meta: {
        syncAt: Date.now() - 1000 * 60,
      },
    });

    const reloaded = await queryService.getSingle(seededTodo.id);
    expect(reloaded.isCompleted).toBe(true);
    expect(reloaded.content).not.toBe('Updated content');
  });

  it('Should not sync if syncAt is newer', async () => {
    await syncService.syncExternalTodo({
      content: 'Updated content',
      description: null,
      isCompleted: false,
      externalId,
      integration: IntegrationEnum.Todoist,
      meta: {
        syncAt: Date.now() + 60 * 1000, // does not make much sense but just to emphasize
      },
    });

    const reloaded = await queryService.getSingle(seededTodo.id);
    expect(reloaded.isCompleted).toBe(false);
    expect(reloaded.content).toBe('Updated content');
  });

  it('Should create new todo if different externalId comes in', async () => {
    await syncService.syncExternalTodo({
      content: 'New content',
      description: null,
      isCompleted: false,
      externalId: '54321',
      integration: IntegrationEnum.Todoist,
      meta: {
        syncAt: Date.now(), // does not make much sense but just to emphasize
      },
    });

    const todos = await queryService.queryTodos({ limit: 100 });
    expect(todos.pagination.total).toBe(2);
    expect(todos.records[0].content).toBe('New content');
  });
});
