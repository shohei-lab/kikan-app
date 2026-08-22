require('dotenv').config();

const path = require('path');
const loadConfig = require('./config');

async function main() {
  const config = await loadConfig();

  // Populate process.env so modules that read it at require-time
  // (db/pool.js) or request-time (routes/auth.js) see the resolved values,
  // regardless of whether they came from Key Vault or .env.
  process.env.DATABASE_URL = config.databaseUrl;
  process.env.SESSION_SECRET = config.sessionSecret;
  process.env.ADMIN_USERNAME = config.adminUsername;
  process.env.ADMIN_PASSWORD_HASH = config.adminPasswordHash;

  const express = require('express');
  const session = require('express-session');
  const requireAuth = require('./middleware/requireAuth');
  const authRoutes = require('./routes/auth');
  const dashboardRoutes = require('./routes/dashboard');
  const productRoutes = require('./routes/products');
  const stockRoutes = require('./routes/stock');
  const orderRoutes = require('./routes/orders');

  const app = express();

  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));

  app.use(express.urlencoded({ extended: true }));
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(
    session({
      secret: config.sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 1000 * 60 * 60 * 8 },
    })
  );

  app.use((req, res, next) => {
    res.locals.username = req.session.username || null;
    next();
  });

  app.use('/', authRoutes);
  app.use('/', requireAuth, dashboardRoutes);
  app.use('/products', requireAuth, productRoutes);
  app.use('/stock', requireAuth, stockRoutes);
  app.use('/orders', requireAuth, orderRoutes);

  app.listen(config.port, '127.0.0.1', () => {
    console.log(`kikan-app listening on http://127.0.0.1:${config.port}`);
  });
}

main().catch((err) => {
  console.error('Failed to start app:', err);
  process.exit(1);
});
