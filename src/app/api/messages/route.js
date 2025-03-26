import { NextResponse } from 'next/server';
import { sendMessage, allMessages,updateMessage } from '../../../controllers/message-controller';
import connectDb from '@/lib/mongodb';

await connectDb();


export const config = {
    api: {
      bodyParser: {
        sizeLimit: '10mb',
      },
    },
  };

export const POST = async (req) => {
    try {
        const body = await req.json(); 
        const result = await sendMessage(body);
        return NextResponse.json({ message: 'Message sent successfully', result }, { status: 200 });
    } catch (error) {
        console.error('Error in POST request:', error.message);
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }
};

export const GET = async (req) => {
    try {
        const chatId = req.nextUrl.searchParams.get('chatId');
        if (!chatId) {
            return NextResponse.json({ error: 'Missing chatId parameter' }, { status: 400 });
        }
        const messages = await allMessages({ chatId });
        return NextResponse.json(messages, { status: 200 });
    } catch (error) {
        console.error('Error in GET request:', error.message);
        return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }
};

export const PATCH=async(req)=>{
    try {
        
          const body = await req.json(); 

          console.log(body);

          const result = await updateMessage(body);

          console.log(result);

        return NextResponse.json({ message: 'Patch request received',result }, { status: 200 });
        
    } catch (error) {
        
        console.error('Error in PATCH request:', error.message);
        return NextResponse.json({ error: 'Failed to process PATCH request' }, { status: 500 });
    }
}