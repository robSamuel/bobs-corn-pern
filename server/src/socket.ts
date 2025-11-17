import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';

let io: SocketIOServer | null = null;

export function initializeSocket(httpServer: HTTPServer): SocketIOServer {
    io = new SocketIOServer(httpServer, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);
        
        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
        });
    });

    return io;
}

export function getIO(): SocketIOServer {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
}

