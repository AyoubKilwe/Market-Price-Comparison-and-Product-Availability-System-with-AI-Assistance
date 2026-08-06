require('dotenv').config();

const cors = require('cors');
const express = require('express');
const { connectDB, disconnectDB } = require('./config/db');
const User = require('./models/User');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');
const aiRoutes = require('./routes/aiRoutes');
const { adminRouter: adminVendorRoutes, router: authRoutes } = require('./routes/authRoutes');
const { adminRouter: adminListingRoutes, router: listingRoutes } = require('./routes/listingRoutes');
const productRoutes = require('./routes/productRoutes');
const { adminRouter: adminShopRoutes, router: shopRoutes } = require('./routes/shopRoutes');

const app = express();

const getCorsOptions = () => {
  const clientUrls = (process.env.CLIENT_URL || '')
    .split(',')
    .map((url) => url.trim().replace(/\/$/, ''))
    .filter(Boolean);

  if (!clientUrls.length) {
    throw new Error('CLIENT_URL is required');
  }

  return {
    origin(origin, callback) {
      if (!origin || clientUrls.includes(origin.replace(/\/$/, ''))) {
        return callback(null, true);
      }
      return callback(new Error('Origin is not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  };
};

app.use(cors(getCorsOptions()));
app.use(express.json({ limit: '5mb' }));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', service: 'marketeye-api' });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminVendorRoutes);
app.use('/api/admin', adminShopRoutes);
app.use('/api/admin', adminListingRoutes);


app.use(notFound);
app.use(errorHandler);

let server;
let isShuttingDown = false;

const ensureAdmin = async () => {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;
  if (password.length < 8) throw new Error('ADMIN_PASSWORD must be at least 8 characters');

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    if (existingUser.role !== 'Admin') {
      existingUser.role = 'Admin';
      existingUser.status = 'Active';
      await existingUser.save();
      console.log(`Existing user promoted to Admin: ${email}`);
    }
    return;
  }

  await User.create({
    name: process.env.ADMIN_NAME?.trim() || 'System Admin',
    email,
    phone: process.env.ADMIN_PHONE?.trim() || '0000000000',
    password,
    role: 'Admin',
    status: 'Active',
  });
  console.log(`Admin account created: ${email}`);
};

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

  await connectDB(process.env.MONGODB_URI || process.env.MONGO_URL);
  await ensureAdmin();

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
