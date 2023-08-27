import { IntegrationEnum } from './integration.enum';

export type ExternalTodoDto = {
  content: string;
  description: string | null;
  isCompleted: boolean;
  integration: IntegrationEnum;
  externalId: string;
  meta: {
    error?: string;
    syncAt: number;
  };
};
