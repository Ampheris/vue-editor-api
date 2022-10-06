const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLNonNull
} = require('graphql');


const DocumentType = new GraphQLObjectType({
    name: 'Document',
    description: 'This represents a document',
    fields: () => ({
        name: {type: new GraphQLNonNull(GraphQLString)},
        content: { type: new GraphQLNonNull(GraphQLString) },
    })
})

module.exports = DocumentType;