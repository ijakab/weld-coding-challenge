import { TodoQueryService } from '../todo-query.service';
import { Test } from '@nestjs/testing';
import { TodoModule } from '../../todo.module';
import { TodoTestMutationService } from './todo-test-mutation.service';

describe('TodoMutationService', () => {
  let mutationService: TodoTestMutationService;
  let queryService: TodoQueryService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [TodoModule],
    }).compile();
    queryService = module.get(TodoQueryService);
    mutationService = module.get(TodoTestMutationService);

    await mutationService.deleteAll();
    await mutationService.seedForQuery();
  });

  it('Should allow filtering by isCompleted', async () => {
    const incomplete = await queryService.queryTodos(
      { limit: 100 },
      { isCompleted: false },
    );
    expect(incomplete.pagination.total).toBe(5);
    expect(incomplete.records.length).toBe(5);

    const complete = await queryService.queryTodos(
      { limit: 100 },
      { isCompleted: true },
    );
    expect(complete.pagination.total).toBe(0);
    expect(complete.records.length).toBe(0);
  });

  it('Should allow filtering by content', async () => {
    const result = await queryService.queryTodos(
      { limit: 100 },
      { content: '#1' },
    );
    expect(result.pagination.total).toBe(1);
    expect(result.records.length).toBe(1);
  });

  it('Should paginate page correctly', async () => {
    const result = await queryService.queryTodos({ limit: 3 });
    expect(result.pagination.total).toBe(5);
    expect(result.records.length).toBe(3);

    const lastElement = result.records.pop();
    const firstElement = result.records[0];
    expect(result.pagination.lastPointer).toBe(lastElement.id);
    expect(result.pagination.firstPointer).toBe(firstElement.id);
  });

  it('Should paginate next page correctly', async () => {
    const firstPage = await queryService.queryTodos({ limit: 3 });

    const secondPage = await queryService.queryTodos({
      limit: 2,
      afterPointer: firstPage.pagination.lastPointer,
    });
    expect(secondPage.records.length).toBe(2);

    const firstPageIds = firstPage.records.map((r) => r.id);
    const secondPageIds = secondPage.records.map((r) => r.id);
    const intersection = firstPageIds.find((firstPageId) =>
      secondPageIds.find((secondPageId) => firstPageId === secondPageId),
    );
    expect(intersection).toBeUndefined();
  });
});
