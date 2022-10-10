const {
    GraphQLObjectType,
    GraphQLList,
    GraphQLString,
} = require('graphql');

const DocumentType = require("./document.js");
const SearchService = require('../services/search.service');

const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        yourDocuments: {
            type: new GraphQLList(DocumentType),
            description: 'List of all documents',
            args: {
                userId: {type: GraphQLString}
            },
            resolve: async function(parent, args) {
                return await SearchService.getAllFiles(args.userId);
            }
        },
    })
});


module.exports = RootQueryType;