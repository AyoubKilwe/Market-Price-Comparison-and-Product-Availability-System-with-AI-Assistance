require('dotenv').config();

const cors = require('cors');
const express = require('express');
const { connectDB, disconnectDB } = require('./config/db');

const app = express();

const getCorsOptions = () => {
  const clientUrl = process.env.CLIENT_URL;

  if (!clientUrl) {
    throw new Error('CLIENT_URL is required');
  }

  return {
    origin: clientUrl,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  };
};

app.use((req, res, next) => cors(getCorsOptions())(req, res, next));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'MarketEye API is running',
  });
});

let server;
let isShuttingDown = false;

const shutdown = async (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`${signal} received. Shutting down gracefully.`);

  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }

  await disconnectDB();
};

const startServer = async () => {
  const port = Number(process.env.PORT) || 5000;

  await connectDB(process.env.MONGODB_URI);

  server = app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });

  return server;
};

if (require.main === module) {
  startServer().catch((error) => {
    console.error(`Failed to start server: ${error.message}`);
    process.exitCode = 1;
  });

  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, async () => {
      try {
        await shutdown(signal);
        process.exit(0);
      } catch (error) {
        console.error(`Graceful shutdown failed: ${error.message}`);
        process.exit(1);
      }
    });
  }
}

module.exports = { app, getCorsOptions, shutdown, startServer };
