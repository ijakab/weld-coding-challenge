import { cleanEnv, str } from 'envalid';

export const environment = cleanEnv(process.env, {
  KAFKA_BROKERS: str({ default: 'localhost:9094' }),
  KAFKA_CLIENT_ID: str({ default: 'weld-ds-client-local' }),
  KAFKA_CONSUMER_GROUP_ID: str({ default: 'weld-ds-consumer-local' }),
  KAFKA_TODO_SYNC_TOPIC: str({ default: 'todo.sync' }),
  KAFKA_TODO_CONTROL_TOPIC: str({ default: 'todo.control' }),
  MONGO_CONNECTION_URL: str({
    // connecting to admin db is not a great idea usually, but it will be automatically created and authorized
    // and this way we can skip some steps in local setup
    default: 'mongodb://root:root@localhost:27017/admin',
  }),
  REDIS_HOST: str({ default: 'localhost' }),
});
