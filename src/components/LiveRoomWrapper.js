"use client";
import { LiveblocksProvider, RoomProvider, ClientSideSuspense } from "@liveblocks/react/suspense";

export default function LiveRoomWrapper({ children, roomId }) {
    return (
        <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
            <RoomProvider id={roomId} initialPresence={{ cursor: null }}>
                <ClientSideSuspense fallback={<div className="flex items-center justify-center h-full text-[#d4d4d4]">Loading live room...</div>}>
                    {children}
                </ClientSideSuspense>
            </RoomProvider>
        </LiveblocksProvider>
    );
}
