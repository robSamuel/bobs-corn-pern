import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import cornRoutes from "./routes/corn.routes";
import isDocker from "is-docker";
import { initializeDatabase } from "./db/init";
import { initializeSocket } from "./socket";

const PORT = 3000;
const app = express();
const httpServer = createServer(app);
const host = isDocker() ? 'express-api' : 'localhost';

// Trust proxy for accurate IP addresses in Docker/behind proxies
app.set('trust proxy', true);

app.use(cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
}));

app.use(express.json());
app.use("/", cornRoutes);

initializeSocket(httpServer);

async function startServer() {
    try {
        await initializeDatabase();
        httpServer.listen(PORT, () => console.log(`Backend ready as ${host} in port: ${PORT}`));
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();