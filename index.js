const express = require('express');
const http = require('http')
const { ApolloServer } = require('apollo-server-express');
const { typeDefs } = require('./schema/index');
const { resolvers } = require('./resolvers/index');
const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core');
const { WebSocketServer } = require('ws');
require('dotenv').config();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./models/user');



PORT = process.env.PORT || 4000;



async function startApolloServer(typeDefs, resolvers) {
    const app = express();
    const httpServer = http.createServer(app);

    const server = new ApolloServer({
        typeDefs,
        resolvers,
        plugins: [
            ApolloServerPluginDrainHttpServer({ httpServer })
        ] ,
        context: async ({ req}) => {
            const auth = req ? req.headers.authorization : null;
            if (auth) {
                const decodedToken =  jwt.verify(auth, process.env.JWT_SECRET);
                const user =  await User.findById(decodedToken.userId);
                if (!user) {
                    throw new Error('User not found');
                }
                return { user };
            }
        }
    })
    await server.start()
    server.applyMiddleware( { app })
    await new Promise(resolve => httpServer.listen({ port: PORT }, resolve));
    console.log(`Server ready at http://localhost:${PORT}${server.graphqlPath}`);
    mongoose.connect(process.env.MONGODB_URI, 
        err => {
            if (err) {
               throw err;
            } else {
                console.log('Connected to MongoDB');
            }
        }
    )
    
}

startApolloServer(typeDefs , resolvers)