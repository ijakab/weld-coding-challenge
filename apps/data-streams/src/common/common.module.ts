import { Module } from '@nestjs/common';
import { TodoModule } from '../todo/todo.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: './src/common/api/schema.gql',
    }),
    TodoModule,
  ],
  controllers: [],
  providers: [],
})
export class CommonModule {}
