import dotenv from 'dotenv';
dotenv.config();

import 'reflect-metadata';
import { ApolloServer } from 'apollo-server-express';
import Express from 'express';
import { buildSchema } from 'type-graphql';
import { createConnection } from 'typeorm';
import session from 'express-session';
import connectRedis from 'connect-redis';
import cors from 'cors';

import { redis } from './redis';
import { RegisterResolver } from './modules/user/Register';
import { LoginResolver } from './modules/user/Login';
import { MeResolver } from './modules/user/Me';
import { ConfirmUserResolver } from './modules/user/ConfirmUser';

const main = async () => {
    await createConnection();

    const schema = await buildSchema({
        resolvers: [RegisterResolver, LoginResolver, MeResolver, ConfirmUserResolver],
        authChecker: ({ context: { req } }) => {
            return req.session.userId ? true : false;
        },
    });
    const apolloServer = new ApolloServer({ schema, context: ({ req }: any) => ({ req }) });

    const app = Express();

    const RedisStore = connectRedis(session);

    app.use(
        cors({
            credentials: true,
            origin: 'http://localhost:3000',
        }),
    );

    app.use(
        session({
            store: new RedisStore({
                client: redis,
            }),
            name: 'qid',
            secret: process.env.SESSION_SECRET || 'defaultSecret',
            resave: false,
            saveUninitialized: false,
            cookie: {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 1000 * 60 * 60 * 24 * 7 * 365, // 7 years
            },
        }),
    );

    apolloServer.applyMiddleware({ app });

    app.listen(4000, () => {
        console.log('Listening on port 4000');
    });
};

main();
