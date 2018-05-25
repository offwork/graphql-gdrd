var fetch = require('node-fetch');
var { URL, URLSearchParams } = require('url');
var util = require('util');
const parseXML = util.promisify(require('xml2js').parseString);
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
  GraphQLList } = require('graphql');

var url = new URL('https://www.goodreads.com/author/show.xml');
var params = {
  id: 4432,
  key: 'zorQ2XJCyz3LS1TLFhwGQg'
};

url.search = new URLSearchParams(params);
/*
fetch(url)
  .then(response => response.text())
  .then(parseXML);*/

const BookType = new GraphQLObjectType({
  name: 'Book',
  description: '...',
  fields: () => ({
    title: {
      type: GraphQLString,
      resolve: xml => xml.title[0]
    },
    isbn: {
      type: GraphQLString,
      resolve: xml => xml.isbn[0]
    }
  })
});

const AuthorType = new GraphQLObjectType({
  name: 'Author',
  description: '...',
  fields: () => ({
    name: {
      type: GraphQLString,
      resolve: xml => xml.GoodreadsResponse.author[0].name[0]
    },
    books: {
      type: new GraphQLList(BookType),
      resolve: xml => xml.GoodreadsResponse.author[0].books[0].book
    }
  })
});

module.exports = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    description: '...',
    fields: () => ({
      author: {
        type: AuthorType,
        args: {
          id: { type: GraphQLInt }
        },
        resolve: (root, args) => fetch(
          `https://www.goodreads.com/author/show.xml?id=${args.id}&key=zorQ2XJCyz3LS1TLFhwGQg`
        )
        .then(response => response.text())
        .then(parseXML)
      }
    })
  })
});
