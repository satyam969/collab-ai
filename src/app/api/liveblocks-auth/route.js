import { Liveblocks } from "@liveblocks/node";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const liveblocks = new Liveblocks({
    secret: process.env.NEXT_LIVEBLOCKS_SECRET_KEY,
});

export async function POST(request) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return new Response("Unauthorized", { status: 403 });
    }

    // Identify the user
    const user = session.user;

    // Start an auth session inside your endpoint
    const authSession = liveblocks.prepareSession(
        user._id || user.email,
        {
            userInfo: {
                name: user.name,
                email: user.email,
                image: user.image,
            }
        }
    );

    // Implement your own access control logic here
    // For now, valid authenticated users get full access to all rooms
    // In production, you should check if the user actually belongs to the project/room
    authSession.allow(`*`, authSession.FULL_ACCESS);

    // Authorize the user and return the result
    const { status, body } = await authSession.authorize();
    return new Response(body, { status });
}
