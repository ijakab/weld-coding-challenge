import { cleanEnv, num, str } from 'envalid';

export const environment = cleanEnv(process.env, {
  KAFKA_BROKERS: str({ default: 'localhost:9094' }),
  KAFKA_CLIENT_ID: str({ default: 'weld-ds-client-local' }),
  KAFKA_CONSUMER_SYNC_GROUP_ID: str({ default: 'weld-ds-sync-consumer-local' }),
  KAFKA_CONSUMER_FAIL_GROUP_ID: str({ default: 'weld-ds-fail-consumer-local' }),
  KAFKA_TODO_SYNC_TOPIC: str({ default: 'todo.sync' }),
  KAFKA_TODO_SYNC_FAIL_TOPIC: str({ default: 'todo.sync.fail' }),
  KAFKA_TODO_SYNC_CORRUPT_TOPIC: str({ default: 'todo.sync.corrupt' }),
  KAFKA_TODO_CONTROL_TOPIC: str({ default: 'todo.control' }),
  KAFKA_RETRY_COUNT: num({ default: 3 }),
  MONGO_CONNECTION_URL: str({
    // connecting to admin db is not a great idea usually, but it will be automatically created and authorized
    // and this way we can skip some steps in local setup
    default: 'mongodb://root:root@localhost:27017/admin',
  }),
  REDIS_HOST: str({ default: 'localhost' }),
});
