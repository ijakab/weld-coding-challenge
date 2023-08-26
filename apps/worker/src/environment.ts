import { cleanEnv, str } from 'envalid';

export const environment = cleanEnv(process.env, {
  KAFKA_BROKERS: str({ default: 'localhost:9094' }),
  KAFKA_CLIENT_ID: str({ default: 'weld-worker-client-local' }),
  KAFKA_CONSUMER_GROUP_ID: str({ default: 'weld-worker-consumer-local' }),
  KAFKA_TODO_SYNC_TOPIC: str({ default: 'todo.sync' }),
  KAFKA_TODO_UPSERT_TOPIC: str({ default: 'todo.upsert' }),
  KAFKA_TODO_CONTROL_TOPIC: str({ default: 'todo.control' }),
  REDIS_HOST: str({ default: 'localhost' }),
  TODOIST_BEARER_TOKEN: str({
    default: '7dc8262798c3321711e5c29ef5cf38f39e7a259b',
  }),
  // the task does specify interval to be every 5 minutes, but that value is not suited for testing and debugging
  // therefor I made it env variable, by default every 10 second, and can be changed in production env
  TODOIST_SYNC_INTERVAL: str({ default: '*/10 * * * * *' }),
});
