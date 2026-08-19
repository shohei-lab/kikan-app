require('dotenv').config();

const express = require('express');
const session = require('express-session');
const path = require('path');

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
    secret: process.env.SESSION_SECRET,
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

const port = process.env.PORT || 3000;
app.listen(port, '127.0.0.1', () => {
  console.log(`kikan-app listening on http://127.0.0.1:${port}`);
});
