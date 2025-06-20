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
const { makeExecutableSchema } = require( '@graphql-tools/schema');
const { useServer } = require('graphql-ws/lib/use/ws'); // تم استيراد الوظيفة useServer من مكتبة graphql-ws وهي مسؤولة عن توصيل الخادم بالواجهة الخلفية للمستخدمين.



PORT = process.env.PORT || 4000;



async function startApolloServer(typeDefs, resolvers) {


    const app = express();
    const httpServer = http.createServer(app);

    // to allow CORS requests from the frontend  يفهم الخادم انه يستقبل طلبات من الواجهة الأمامية باستخدام token
    app.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', process.env.APP_URL);
        next();
    })

    const schema = makeExecutableSchema({ typeDefs, resolvers });

    const wsServer = new WebSocketServer({
        server : httpServer,
        path: '/graphql'
    })

    const serverCleanup = useServer({ schema}, wsServer);
    const server = new ApolloServer({
        typeDefs,
        resolvers,
        plugins: [
            ApolloServerPluginDrainHttpServer({ httpServer }),
            {
                 async serverWillStart(){
                    return {
                        async drainServer(){
                            // 
                            await serverCleanup.dispose();
                        }
                    }
                }
            }
        ] ,
       context: async ({ req}) => {
            const auth = req ? req.headers.authorization : null;
            if (auth) {
                const decodedToken = jwt.verify(
                    auth.slice(4), process.env.JWT_SECRET
                );
                const user = await User.findById(decodedToken.id);
                if (!user) {
                    throw new Error('User not found');
                }
                return { user };
            }
        }
    })
    await server.start()
    // Apply middleware to connect Apollo Server with Express
    server.applyMiddleware( { app })
    await new Promise(resolve => httpServer.listen({ port: PORT }, resolve));
    console.log(`Server ready at http://localhost:${PORT}${server.graphqlPath}`);

    await mongoose.connect(process.env.MONGODB_URI, 
        err => {
            if (err) {
               throw err;
            } else {
                console.log('Connected to MongoDB');
            }
        }
    )
    
}

mongoose.set('strictQuery', false); // أو false حسب رغبتك يعني إذا كانت القيمة صحيحة في الاستعلام فقط سيتم تنفيذها وإلا فلا يتم تنفيذها

startApolloServer(typeDefs , resolvers)