export const listPosts = /* GraphQL */ `
  query ListPosts(
    $filter: ModelPostFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listPosts(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        title
        content
        username
        coverImage
        comments {
          items {
          id
          message
          postID
          createdAt
          updatedAt
          createdBy
        }
          nextToken
        }
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;