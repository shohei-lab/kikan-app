const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

const LOW_STOCK_THRESHOLD = 5;

router.get('/', async (req, res) => {
  const { rows: productCountRows } = await pool.query('SELECT COUNT(*) FROM products');
  const { rows: lowStockRows } = await pool.query(
    'SELECT COUNT(*) FROM stock_balances WHERE balance < $1',
    [LOW_STOCK_THRESHOLD]
  );
  const { rows: todayOrderRows } = await pool.query(
    "SELECT COUNT(*) FROM orders WHERE created_at >= date_trunc('day', now())"
  );
  const { rows: recentTransactions } = await pool.query(
    `SELECT st.*, p.name AS product_name
     FROM stock_transactions st
     JOIN products p ON p.id = st.product_id
     ORDER BY st.created_at DESC
     LIMIT 5`
  );

  res.render('dashboard', {
    productCount: productCountRows[0].count,
    lowStockCount: lowStockRows[0].count,
    todayOrderCount: todayOrderRows[0].count,
    recentTransactions,
  });
});

module.exports = router;
