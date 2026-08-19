const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

router.get('/', async (req, res) => {
  const { rows: balances } = await pool.query('SELECT * FROM stock_balances ORDER BY product_id');
  const { rows: transactions } = await pool.query(
    `SELECT st.*, p.name AS product_name, p.sku
     FROM stock_transactions st
     JOIN products p ON p.id = st.product_id
     ORDER BY st.created_at DESC
     LIMIT 50`
  );
  res.render('stock/list', { balances, transactions });
});

router.get('/new', async (req, res) => {
  const { rows: products } = await pool.query('SELECT * FROM products ORDER BY name');
  res.render('stock/form', { products, error: null });
});

router.post('/', async (req, res) => {
  const { product_id, type, quantity, note } = req.body;
  try {
    await pool.query(
      'INSERT INTO stock_transactions (product_id, type, quantity, note) VALUES ($1, $2, $3, $4)',
      [product_id, type, Number(quantity), note || null]
    );
    res.redirect('/stock');
  } catch (err) {
    const { rows: products } = await pool.query('SELECT * FROM products ORDER BY name');
    res.render('stock/form', { products, error: '入力に誤りがあります(数量は1以上の整数)' });
  }
});

module.exports = router;
