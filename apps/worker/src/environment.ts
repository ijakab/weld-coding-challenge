import { cleanEnv, str } from 'envalid';

export const environment = cleanEnv(process.env, {
  KAFKA_BROKERS: str({ default: 'localhost:9094' }),
  KAFKA_CLIENT_ID: str({ default: 'weld-worker-client-local' }),
  KAFKA_CONSUMER_GROUP_ID: str({ default: 'weld-worker-consumer-local' }),
  KAFKA_TODO_SYNC_TOPIC: str({ default: 'todo.sync' }),
  KAFKA_TODO_UPSERT_TOPIC: str({ default: 'todo.upsert' }),
});
