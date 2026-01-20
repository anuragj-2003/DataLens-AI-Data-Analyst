
// FILE: main.js
// DESCRIPTION:
// The entry point for the Backend Application.
// It initializes the Express server, connects to the Database,
// sets up Middleware (CORS, JSON), and registers all API Routers.
// It also handles safe startup by killing any process blocking the port.


const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const connectDB = require('./utils/db');
const { startCleanupJob } = require('./utils/cleanup');

// 1. Initialize Database on Startup
connectDB();
// 2. Start File Cleanup Job
startCleanupJob();

const app = express();
const PORT = process.env.PORT || 8000;

// MIDDLEWARE SETUP
app.use(cors({
    origin: '*', // Allow all origins (Dev mode)
    // credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ROUTER REGISTRATION
// ROUTER REGISTRATION
const authRouter = require('./routers/auth');
const chatRouter = require('./routers/chat');
const documentsRouter = require('./routers/documents');
const settingsRouter = require('./routers/settings');
const feedbackRouter = require('./routers/feedback');

const apiRouter = express.Router();
apiRouter.use('/auth', authRouter);
apiRouter.use('/chat', chatRouter);
apiRouter.use('/documents', documentsRouter);
apiRouter.use('/settings', settingsRouter);
apiRouter.use('/feedback', feedbackRouter);

// Mount the API router at both root (for local) and /api (for Vercel/prod)
app.use('/', apiRouter);
app.use('/api', apiRouter);

// Health Check Endpoint
app.get('/', (req, res) => {
    res.json({ message: "GenAI Workspace API is running" });
});

const { exec } = require('child_process');

// HELPER: killProcessOnPort
// DESCRIPTION: checks if port 8000/5000 is used and kills the process.
// This prevents "EADDRINUSE" errors during dev restarts.
const killProcessOnPort = (port) => {
    return new Promise((resolve) => {
        exec(`lsof -i :${port} -t`, (error, stdout, stderr) => {
            if (error || !stdout) {
                return resolve();
            }
            const pids = stdout.trim().split('\n');
            console.log(`Found processes on port ${port}: ${pids.join(', ')}. Killing...`);

            const killPromises = pids.map(pid => {
                return new Promise((resKill) => {
                    exec(`kill -9 ${pid}`, (err) => {
                        if (!err) console.log(`Killed process ${pid}`);
                        resKill();
                    });
                });
            });

            Promise.all(killPromises).then(() => {
                // Wait a moment for OS to release the port
                setTimeout(resolve, 1000);
            });
        });
    });
};

// START SERVER
const startServer = async () => {
    try {
        await killProcessOnPort(PORT);
        const server = app.listen(PORT, '0.0.0.0', () => {
            console.log(`Server is running on port ${PORT}`);
        });

        server.on('error', (e) => {
            if (e.code === 'EADDRINUSE') {
                console.error(`ERROR: Port ${PORT} is still in use!`);
            } else {
                console.error("Server Error:", e);
            }
        });
    } catch (e) {
        console.error("Failed to start server:", e);
    }
};

process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('UNHANDLED REJECTION:', reason);
});

if (require.main === module) {
    startServer();
}

module.exports = app;
