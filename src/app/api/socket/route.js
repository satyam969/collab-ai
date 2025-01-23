import { Server } from "socket.io";
import { generateResult } from "@/services/ai-services";

let io;

export async function GET(req, res) {
    if (!res.socket.server.io) {
        console.log("Initializing Socket.IO...");

        io = new Server(res.socket.server, {
            path: '/api/socket',
        });

        io.on("connection", (socket) => {
            console.log("A user connected:", socket.id);

            socket.on("joinProject", (projectid) => {
                socket.join(projectid);
                console.log(`User joined project: ${projectid}`);
            });

            socket.on("sendMessage", async ({ projectid, content, sender }) => {
                console.log(`Message received for project ${projectid}:`, content);

                const aiIsPresentInMessage = content.includes("@ai");

                io.to(projectid).emit("receiveMessage", {
                    projectid,
                    content,
                    sender,
                });

                if (aiIsPresentInMessage) {
                    const prompt = content.replace("@ai", "").trim();
                    try {
                        const response = await generateResult(prompt);
                        io.to(projectid).emit("receiveMessage", {
                            projectid,
                            content: response,
                            sender,
                        });
                    } catch (error) {
                        console.error("Error generating AI response:", error);
                    }
                }
            });

            socket.on("disconnect", (reason) => {
                console.log(`A user disconnected: ${socket.id}, Reason: ${reason}`);
            });
        });

        res.socket.server.io = io;
    } else {
        console.log("Socket.IO already initialized.");
    }

    res.status(200).json({ message: "Socket.IO initialized" });
}
