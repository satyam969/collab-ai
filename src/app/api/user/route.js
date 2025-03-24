import connectDb from '@/lib/mongodb';
import { NextResponse } from 'next/server';

const { allusers } = require('../../../controllers/user-controller');  

await connectDb();

export const GET= async(req) => {  
  
            try {  
                const usersearch = req.nextUrl.searchParams.get('usersearch'); 
                const users=await allusers(usersearch); 
                return NextResponse.json(users, { status: 200 });
            } catch (error) {  
                console.error('Error in handler:', error);
                return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
            }  
          
        }

        export const POST = async(req) => {
            try {
                const body=await req.body();

                const newUser = JSON.parse(body);
                await createUser(newUser);
                
                return NextResponse.json({ message: 'User added successfully' }, { status: 201 });
                
            } catch (error) {
                
                console.error('Error in handler:', error);
                return NextResponse.json({ error: 'Failed to add user' }, { status: 500 });
            }
        }