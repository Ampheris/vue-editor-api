const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLNonNull
} = require('graphql');

const TeacherType = new GraphQLObjectType({
    name: 'Student',
    description: 'This represents a student',
    fields: () => ({
        name: { type: new GraphQLNonNull(GraphQLString) },
        acronym: { type: new GraphQLNonNull(GraphQLString) },
    })
})

module.exports = TeacherType;