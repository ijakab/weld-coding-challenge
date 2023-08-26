import { TodoistItem } from './todoist-item';

export type TodoistSyncResponse = {
  sync_token: string;
  items: TodoistItem[];
};
