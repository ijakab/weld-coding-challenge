# Weld coding challenge

A distributed software for synchronizing data from external API to the central database.

## Setup

Firstly, we need to initialize yarn and install dependencies. It can be done by

```shell
yarn
```

Make sure that ports for this app free. By default, they are: 27017 (mongo), 9094(kafka), 8080 (kafka ui), 6379 (redis) and 3000 (main api)

Setup all the external services. This is done over docker compose by running

```shell
yarn setup
```

This will bring up all the services app uses, as well as configure them (create some kafka topics)

> There may be some error logs if kafka cannot start before topic creation starts. Those can safely be ignored, as there is built in retry and topics will be created

Finally, app can be started by running

```shell
yarn start # For main app
yarn start worker # For worker
```

To start, you can call `startFetching` which will tell worker to start fetching and will fill your database with existing data.

> Please, after testing it out, call stopFetching mutation so that API does not get triggered. It is on free mode, I hope it will not hit limit

### Tests

I have written some unit and integration tests. Of course, real world app could always use more testing - it is not total coverage, but I have some for showcase. For these to run make sure you've run setup before, as a number of integration tests do use external services

```shell
yarn test
```

> Tests will delete all data in database and create its own. There is no separate test infrastructure.

> Possible improvement: I have added --force-exit flag to the command. A way to go would be to remove certain connections on lifecycle hooks. To save some time, I just used --force-exit flag.

## Technology choices

- **Open API** - I have decided to go with [Todoist](https://developer.todoist.com/guides/#developing-with-todoist). Todos are kind of classic for showcases, and todoist provides Sync API which is ideal for cron job syncing as specified by the requirements. It can provide the changes from your last sync, which removes a lot of trouble in synchronization.

- **Data storage** - I chose MongoDB for this project. When we are need to store data at big scale, Mongo comes as natural choice for its ability to scale better and at lower cost and better performance than traditional databases. It is surely the most popular document database, is not specific to certain use case or vendor-locked and has a great community.

- **Communication pattern** - EventPattern. For this case, event pattern is the choice as the commands can execute asynchronously and do not need response back. This decouples specific API integration logic from the main logic, and those can scale independently, as well as allowing easy integration with other APIs or data sources.

- **Communication protocol** - Kafka - again, a technology that comes as a natural choice and has few competitors we are looking for a well known, widely used and not vendor locked message broker that can scale to support large scale data pipeline. While other choices listed on nest can transmit messages, kafka can store them, redeliver later, keep track of various consumer offsets for topics, guarantee delivery and in-order delivery etc. We have utilized some of these functionalities in this project to gain better resilience and reliability, as explained by the comments

- **Caching** - Redis - similar logic: open source, widely used, not vendor locked, can scale - a way to go.

- **API protocol** - Graphql - It is written in the requirements that the Company uses graphql, so figured it would be a nice addition

## Contracts

Graphql contract:

```graphql
type TodoType {
    id: String!
    content: String!
    description: String
    isCompleted: Boolean!
}

type PaginationType {
    total: Int!
    firstPointer: String
    lastPointer: String
}

type PaginatedTodoType {
    pagination: PaginationType!
    records: [TodoType!]!
}

type Query {
    queryTodos(pagination: PaginationInput!, filters: TodoFilterInput): PaginatedTodoType!
    singleTodo(id: String!): TodoType!
}

input PaginationInput {
    limit: Int!
    beforePointer: String
    afterPointer: String
}

input TodoFilterInput {
    isCompleted: Boolean
    content: String
}

type Mutation {
    startFetching: Boolean!
    stopFetching: Boolean!
}
```

Todoist sync API is documented (here)[https://developer.todoist.com/sync/v8/#read-resources]

### Internal communication

For internal communication. First is for controlling weather worker will fetch the data from the third API

```typescript
// Topic todo.control
export type Contract = {
    fetch: boolean
}
```

Then there are different channels all with the same contract that accept common todo interface

```typescript
// Topics todo.sync todo.sync.fail todo.sync.corrupt
export type Contract = {
    content: string;
    description: string | null;
    isCompleted: boolean;
    integration: IntegrationEnum;
    externalId: string;
    meta: {
        error?: string;
        syncAt: number;
    };
}
```

Reasoning is explained further in code comments, but the brief idea

- todo.sync will always commit offset, so that if some messages cannot be processed they will not hold the stream
- todo.sync.fail will hold the messages that were not processed the first time, and can be retried multiple times. If there is an error in the system, listeners will pick up failed messages from this stream later and process them
- todo.sync.corrupt will hold the messages that are identified as having the bad structure or otherwise cannot be processed due to the content of the message, and not due to the error in system. They are not consumed, just held for debugging and fallback

## Infrastructure

data-streams - It collects data over Kafka (`todo.sync` topic) and stores it into MongoDB. It exposes Graphql API that various clients can connect to and retrieve that data

worker - It collects the data from Todoist API on the regular time interval, transforms it to a common interface and sends it to kafka topic (`todo.sync`). It also uses Redis to store certain configuration

## Code architecture

General project architecture is split into microservices which are split into modules. All the files relevant to a module are contained in the respective directory

There is common and todo module in the main app, app could be extended with more. There is also common and todoist module in the worker, where new modules would represent different integration. Common modules generally represent logic that I taught would be common if app grew in a certain way.

Main app does not know anything about specifics of Todoist integration and communicates over the common interface. 

### Layered design

Each module consist of three layers, each having separate directory inside module:

- **Data layer** - responsible for storing or fetching data for a specific storage or third party api. Does not know about business logic. For this project, daya layer has integrations with todoist API (worker) and mongo (main app).

- **Domain layer** - responsible for the core of the business logic. Is not aware about specifics of execution context (e.g. nothing connected to graphql/rest/kafka). It is ment to communicate with API layer over defined contracts, so it can be reused across multiple points of access (graphql, kafka). In this project, domain layer is responsible for logic in syncing with todo (but not specifics of API), pagination, serialization and more.

- **API layer** - responsible for accepting requests from various clients or internal sources that need to interact with our app. Does not know about business logic. In our project, it parses Graphql calls and kafka event and delegates job to domain layer over specified interface

### Coding principles

I have tried my best to build a code that is easy to understand while being flexible, following DI and OO patterns already set up by Nest ecosystem. Each class has a single responsibility (as much as it is reasonable) and dependencies are injected.

Shortcuts have been used from time to time, and code is left with many comments, so please read my reasoning in those.

## Possible improvements

1. More splitting - This would probably be overcomplicating for this case, but if the load is really high it is better to split the functionalities into separate deployable services so that each can scale on its own horizontally. In the case of main service, we could have separate service reading main data stream, another failed data stream, another accepting HTTP requests. In the case of worker, we could separately deploy the code that runs on schedule and the one that transforms the data. All depends on the load and the amount of work (especially synchronous work)
2. Cloud scheduler - As explained in the code, I would probably not have in memory scheduler but dedicated service that can guarantee time triggered events, which would allow the worker to scale horizontally
3. Protobuf - If we have large messages, encoding them in protobuf or afro can greatly reduce kafka disk usage
4. Better todo queries - Obviously querying todos is limited in filtering options, pagination and sorting. We'd need to figure out requirements and, design proper indexing and expose more flexible API
5. Two-way sync - it is possible that app grows so that data can be edited through this system. In that case we would need to make sync in different direction - from our system to the third party API
