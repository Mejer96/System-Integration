
import { createClient } from 'graphql-ws';


const client = createClient({
  url: 'ws://localhost:4000/graphql', // Match your server's WebSocket path
});


const BOOK_ADDED_SUBSCRIPTION = `
  subscription {
    bookAdded {
      id
      title
      author {
        id
        name
      }
    }
  }
`;

client.subscribe(
  {
    query: BOOK_ADDED_SUBSCRIPTION,
  },
  {
    next: (data) => {
      console.log('New book added:', data.data.bookAdded);
    },
    error: (err) => {
      console.error('Subscription error:', err);
    },
    complete: () => {
      console.log('Subscription ended');
    },
  }
);

// Optional: Keep Node.js alive
// process.stdin.resume();
