import { cleanEnv, str } from 'envalid';

export const environment = cleanEnv(process.env, {
  KAFKA_BROKERS: str({ default: 'localhost:9094' }),
  KAFKA_CLIENT_ID: str({ default: 'weld-ds-client-local' }),
  KAFKA_CONSUMER_GROUP_ID: str({ default: 'weld-ds-consumer-local' }),
});
