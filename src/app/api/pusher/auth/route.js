// import { pusherServer } from '@/lib/pusherServer';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/auth'; 

// export async function POST(request) {
//   try {
//     const session = await getServerSession(authOptions);

//     console.log('Pusher auth request session:', session);
    
//     if (!session || !session.user) {
//       return new Response(JSON.stringify({ error: 'Unauthorized' }), {
//         status: 403,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//     const body = await request.json();
//     const { socket_id, channel_name } = body;

//     if (!socket_id || !channel_name) {
//       return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
//         status: 400,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//     // Check if it's a presence channel for CRDT collaboration
//     if (channel_name.startsWith('presence-crdt-')) {
//       const presenceData = {
//         user_id: session.user._id,
//         user_info: {
//           id: session.user._id,
//           name: session.user.name,
//           email: session.user.email,
//           color: generateUserColor(session.user._id),
//         }
//       };

//       const auth = pusherServer.authorizeChannel(socket_id, channel_name, presenceData);
//       return new Response(JSON.stringify(auth), {
//         status: 200,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//     // For regular private channels
//     const auth = pusherServer.authorizeChannel(socket_id, channel_name);
//     return new Response(JSON.stringify(auth), {
//       status: 200,
//       headers: { 'Content-Type': 'application/json' },
//     });

//   } catch (error) {
//     console.error('Pusher auth error:', error);
//     return new Response(JSON.stringify({ error: 'Internal server error' }), {
//       status: 500,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   }
// }

// // Helper function to generate consistent colors for users
// function generateUserColor(userId) {
//   const colors = [
//     '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
//     '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
//   ];
//   const hash = userId.split('').reduce((a, b) => {
//     a = ((a << 5) - a) + b.charCodeAt(0);
//     return a & a;
//   }, 0);
//   return colors[Math.abs(hash) % colors.length];
// }

// import { pusherServer } from '@/lib/pusherServer';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/lib/auth';

// export async function POST(request) {
//   try {
//     const session = await getServerSession(authOptions);
    
//     console.log('Pusher auth request session:', session);
    
//     if (!session || !session.user) {
//       return new Response(JSON.stringify({ error: 'Unauthorized' }), {
//         status: 403,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//     // Parse form-encoded data instead of JSON
//     const formData = await request.text();
//     const params = new URLSearchParams(formData);
//     const socket_id = params.get('socket_id');
//     const channel_name = params.get('channel_name');

//     console.log('Pusher auth params:', { socket_id, channel_name });

//     if (!socket_id || !channel_name) {
//       return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
//         status: 400,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//     // Check if it's a presence channel for CRDT collaboration
//     if (channel_name.startsWith('presence-crdt-')) {
//       const presenceData = {
//         user_id: session.user._id || session.user.id,
//         user_info: {
//           id: session.user._id || session.user.id,
//           name: session.user.name,
//           email: session.user.email,
//           color: generateUserColor(session.user._id || session.user.id),
//         }
//       };

//       console.log('Authorizing presence channel with data:', presenceData);

//       const auth = pusherServer.authorizeChannel(socket_id, channel_name, presenceData);
      
//       // Return the auth string directly, not wrapped in JSON
//       return new Response(auth, {
//         status: 200,
//         headers: { 'Content-Type': 'application/json' },
//       });
//     }

//     // For regular private channels
//     console.log('Authorizing private channel');
    
//     const auth = pusherServer.authorizeChannel(socket_id, channel_name);
    
//     // Return the auth string directly, not wrapped in JSON
//     return new Response(auth, {
//       status: 200,
//       headers: { 'Content-Type': 'application/json' },
//     });

//   } catch (error) {
//     console.error('Pusher auth error:', error);
//     return new Response(JSON.stringify({ error: 'Internal server error' }), {
//       status: 500,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   }
// }

// // Helper function to generate consistent colors for users
// function generateUserColor(userId) {
//   const colors = [
//     '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
//     '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
//   ];
  
//   if (!userId) {
//     return colors[0]; // Default color if no userId
//   }
  
//   const hash = String(userId).split('').reduce((a, b) => {
//     a = ((a << 5) - a) + b.charCodeAt(0);
//     return a & a;
//   }, 0);
  
//   return colors[Math.abs(hash) % colors.length];
// }


import { pusherServer } from '@/lib/pusherServer';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    
    console.log('Pusher auth request session:', session);
    
    if (!session || !session.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Parse form-encoded data instead of JSON
    const formData = await request.text();
    const params = new URLSearchParams(formData);
    const socket_id = params.get('socket_id');
    const channel_name = params.get('channel_name');

    console.log('Pusher auth params:', { socket_id, channel_name });

    if (!socket_id || !channel_name) {
      return new Response(JSON.stringify({ error: 'Missing required parameters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if it's a presence channel for CRDT collaboration
    if (channel_name.startsWith('presence-crdt-')) {
      const presenceData = {
        user_id: session.user._id || session.user.id,
        user_info: {
          id: session.user._id || session.user.id,
          name: session.user.name,
          email: session.user.email,
          color: generateUserColor(session.user._id || session.user.id),
        }
      };

      console.log('Authorizing presence channel with data:', presenceData);

      // Get the auth response from Pusher
      const authResponse = pusherServer.authorizeChannel(socket_id, channel_name, presenceData);
      
      console.log('Auth response from Pusher:', authResponse);
      
      // Return the auth response as-is (it's already a JSON string)
      return new Response(JSON.stringify(authResponse), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // For regular private channels
    console.log('Authorizing private channel');
    
    const authResponse = pusherServer.authorizeChannel(socket_id, channel_name);
    
    console.log('Auth response from Pusher:', authResponse);


    console.log('Stringified JSON',JSON.stringify(authResponse));
    
    // Return the auth response as-is (it's already a JSON string)
    // const responseData = typeof authResponse === 'string' ? authResponse : JSON.stringify(authResponse);
    
     // *** THE FIX IS ALSO APPLIED HERE ***
     return new Response(authResponse, {
      status: 200,
      headers: { 'Content-Type': 'application/json'  },
  });


  } catch (error) {
    console.error('Pusher auth error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Helper function to generate consistent colors for users
function generateUserColor(userId) {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];
  
  if (!userId) {
    return colors[0]; // Default color if no userId
  }
  
  const hash = String(userId).split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  return colors[Math.abs(hash) % colors.length];
}