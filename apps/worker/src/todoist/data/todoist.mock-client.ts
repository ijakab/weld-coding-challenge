import { TodoistSyncResponse } from './dto/todoist-sync-response';

export const mockedTodoItems = [
  {
    id: '12345',
    content: 'This is a test todo',
    description: 'Test description',
    completed_at: null,
    user_id: '7342',
  },
  {
    id: '12346',
    content: 'This is a test todo',
    description: 'Test description',
    completed_at: null,
    user_id: '7342',
  },
];

export class TodoistMockClient {
  public findChanges(syncToken: string): Promise<TodoistSyncResponse> {
    return Promise.resolve({
      items: mockedTodoItems,
      sync_token: syncToken,
    });
  }
}
