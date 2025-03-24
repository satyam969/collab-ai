import { NextResponse } from 'next/server';
import {
    addUser,
    accessChat,
    fetchProjects,
    removeUser
} from '../../../controllers/chat-controllers';
import connectDb from '@/lib/mongodb';

await connectDb();

export const POST = async (req) => {
    try {
        const body = await req.json();
        if(body.projectname){
            const result = await accessChat(body);
            return NextResponse.json({ message: 'Chat created successfully', result }, { status: 200 });
        }
        else if (body.projectid && !body.userId) {
            const result = await accessChat(body);
            return NextResponse.json({ message: 'Chat accessed successfully', result }, { status: 200 });
        } else if (body.userId) {
            const result = await addUser(body);
            return NextResponse.json({ message: 'User added successfully', result }, { status: 200 });
        } else {
            return NextResponse.json({ error: 'Invalid request. Provide either projectid or userId.' }, { status: 400 });
        }
    } catch (error) {
        console.error('Error in POST request:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
};

export const GET = async (req) => {
    try {
        const userId = req.nextUrl.searchParams.get('userId');

    // console.log(userId);
    if (!userId) {
        return NextResponse.json({ error: 'Invalid request. User ID is required.' }, { status: 400 });
    }
        const result = await fetchProjects(userId);
        return NextResponse.json({ projects: result }, { status: 200 });
    } catch (error) {
        console.error('Error in GET request:', error);
        return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
    }
};

export const DELETE = async (req) => {
    try {
        const userId = req.nextUrl.searchParams.get('userId');
        const projectid = req.nextUrl.searchParams.get('projectid');
        const body={projectid, userId};

        if (!userId ||!projectid) {
            return NextResponse.json({ error: 'Invalid request. User ID and project ID are required.' }, { status: 400 });
        }

        console.log(body);

        const result = await removeUser(body);

        return NextResponse.json({ message: 'User removed successfully', result }, { status: 200 });
    } catch (error) {
        console.error('Error in DELETE request:', error);
        return NextResponse.json({ error: 'Failed to remove user' }, { status: 500 });
    }
};
