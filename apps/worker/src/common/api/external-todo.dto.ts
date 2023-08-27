import { IntegrationEnum } from './integration.enum';

export type ExternalTodoDto = {
  content: string;
  description: string | null;
  isCompleted: boolean;
  integration: IntegrationEnum;
  externalId: string;
  meta: {
    retry: number;
    error?: string;
  };
};
