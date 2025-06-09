const resolvers = {
    Query: {
        hello: () => 'Hello, world! in the event books app from Hsoub',
        goodbye: () => 'Goodbye, world!',
        // books : () => [
        //     { title: 'The Great Gatsby', author: 'F. Scott Fitzgerald' },
        //     { title: 'The Catcher in the Rye', author: 'J.D. Salinger' },
        //     { title: 'The Grapes of Wrath', author: 'John Steinbeck' }
        // ]
    },
    // Mutation: {
    //     greet: (_, { name }) => `Hello, ${name}!`
    // }
}

module.exports = { resolvers}