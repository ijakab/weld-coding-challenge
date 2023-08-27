import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { MongooseModule } from '@nestjs/mongoose';
import { environment } from '../environment';
import { KafkaService } from './api/kafka.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TodoConfig } from '../todo/todo-config';

@Module({
  imports: [
    MongooseModule.forRoot(environment.MONGO_CONNECTION_URL),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: './src/common/api/schema.gql',
    }),
    ClientsModule.register([
      {
        name: TodoConfig.KafkaDIName,
        transport: Transport.KAFKA,
        options: {
          client: {
            clientId: environment.KAFKA_CLIENT_ID,
            brokers: environment.KAFKA_BROKERS.split(','),
          },
        },
      },
    ]),
  ],
  controllers: [],
  providers: [KafkaService],
  exports: [KafkaService],
})
export class CommonModule {}
