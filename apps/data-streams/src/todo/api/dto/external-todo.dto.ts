import { IntegrationEnum } from './integration.enum';

export type ExternalTodoDto = {
  content: string;
  description: string | null;
  isCompleted: string;
  integration: IntegrationEnum;
  externalId: string;
};
