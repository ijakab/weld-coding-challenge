import { TodoSerializer } from '../serialization/todo.serializer';
import { Todo } from '../../data/todo.schema';

describe('TodoSerializer', () => {
  const todoSerializer = new TodoSerializer();

  const todoData = new Todo();
  todoData.isCompleted = false;
  todoData.content = 'Test todo';
  todoData.description = null;

  const todoTypeData = {
    content: 'Test todo',
    isCompleted: false,
    description: null,
  };

  it('Should serialize single instance', () => {
    const result = todoSerializer.single(todoData);

    expect(result).toMatchObject(todoTypeData);
  });

  it('Should serialize list instance', () => {
    const inputList = [todoData, todoData];
    const result = todoSerializer.list(inputList);

    expect(result).toMatchObject([todoTypeData, todoTypeData]);
  });

  it('Should serialize paginated instance', () => {
    const input = {
      pagination: { total: 2 },
      records: [todoData, todoData],
    };
    const result = todoSerializer.pagination(input);

    expect(result).toMatchObject({
      pagination: { total: 2 },
      records: [todoTypeData, todoTypeData],
    });
  });
});
