// import Pusher from 'pusher-js';

// export const pusherClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
//   cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
//   forceTLS: true, 
// });

import PusherJs from 'pusher-js';

export const pusherClient = new PusherJs(process.env.NEXT_PUBLIC_PUSHER_KEY, {
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
  authEndpoint: '/api/pusher/auth',
  auth: {
    headers: {
      // 'Content-Type': 'application/json',
      //  'Content-Type': 'application/x-www-form-urlencoded',
    },
  },
  // Enable client events for CRDT collaboration
  enabledTransports: ['ws', 'wss'],
    enableLogging: true,
});


