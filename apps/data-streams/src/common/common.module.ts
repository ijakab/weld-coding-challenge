import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { MongooseModule } from '@nestjs/mongoose';
import { environment } from '../environment';

@Module({
  imports: [
    MongooseModule.forRoot(environment.MONGO_CONNECTION_URL),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: './src/common/api/schema.gql',
    }),
  ],
  controllers: [],
  providers: [],
})
export class CommonModule {}
