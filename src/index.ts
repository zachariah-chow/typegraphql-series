import 'reflect-metadata';
import { ApolloServer } from 'apollo-server-express';
import * as Express from 'express';
import { Query, Resolver, buildSchema } from 'type-graphql';
import { createConnection } from 'typeorm';

@Resolver()
class TestResolver {
    @Query(() => String)
    async testQuery() {
        return 'Test Query';
    }
}

const main = async () => {
    await createConnection();

    const schema = await buildSchema({
        resolvers: [TestResolver],
    });
    const apolloServer = new ApolloServer({ schema });

    const app = Express();

    apolloServer.applyMiddleware({ app });

    app.listen(4000, () => {
        console.log('Listening on port 4000');
    });
};

main();
