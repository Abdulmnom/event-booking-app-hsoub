const express = require('express');
const http = require('http')
const { ApolloServer } = require('apollo-server-express');
const { typeDefs } = require('./schema/index');
const { resolvers } = require('./resolvers/index');
const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core');
const { WebSocketServer } = require('ws');
require('dotenv').config();


PORT = process.env.PORT || 4000;



async function startApolloServer(typeDefs, resolvers) {
    const app = express();
    const httpServer = http.createServer(app);

    const server = new ApolloServer({
        typeDefs,
        resolvers,
        plugins: [
            ApolloServerPluginDrainHttpServer({ httpServer })
        ]
    })
    await server.start()
    server.applyMiddleware( { app })
    await new Promise(resolve => httpServer.listen({ port: PORT }, resolve));
    console.log(`Server ready at http://localhost:${PORT}${server.graphqlPath}`);
    
}

startApolloServer(typeDefs , resolvers)