const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLNonNull
} = require('graphql');

const TeacherType = new GraphQLObjectType({
    name: 'Student',
    description: 'This represents a student',
    fields: () => ({
        name: { type: GraphQLNonNull(GraphQLString) },
        acronym: { type: GraphQLNonNull(GraphQLString) },
    })
})

module.exports = TeacherType;