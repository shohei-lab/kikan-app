const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

router.get('/', async (req, res) => {
  const statusFilter = req.query.status;
  const params = [];
  let where = '';
  if (statusFilter) {
    params.push(statusFilter);
    where = 'WHERE status = $1';
  }
  const { rows: orders } = await pool.query(
    `SELECT * FROM orders ${where} ORDER BY created_at DESC`,
    params
  );
  res.render('orders/list', { orders, statusFilter: statusFilter || '' });
});

router.get('/new', async (req, res) => {
  const { rows: products } = await pool.query('SELECT * FROM products ORDER BY name');
  res.render('orders/form', { products, error: null });
});

router.post('/', async (req, res) => {
  const { customer_name, product_id, quantity } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const orderNo = 'ORD-' + Date.now();
    const { rows: orderRows } = await client.query(
      'INSERT INTO orders (order_no, customer_name) VALUES ($1, $2) RETURNING id',
      [orderNo, customer_name]
    );
    const { rows: productRows } = await client.query('SELECT unit_price FROM products WHERE id = $1', [
      product_id,
    ]);
    await client.query(
      'INSERT INTO order_items (order_id, product_id, quantity, unit_price_snapshot) VALUES ($1, $2, $3, $4)',
      [orderRows[0].id, product_id, Number(quantity), productRows[0].unit_price]
    );
    await client.query('COMMIT');
    res.redirect('/orders');
  } catch (err) {
    await client.query('ROLLBACK');
    const { rows: products } = await pool.query('SELECT * FROM products ORDER BY name');
    res.render('orders/form', { products, error: '入力に誤りがあります' });
  } finally {
    client.release();
  }
});

router.get('/:id', async (req, res) => {
  const { rows: orderRows } = await pool.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
  if (!orderRows[0]) return res.redirect('/orders');
  const { rows: items } = await pool.query(
    `SELECT oi.*, p.name AS product_name, p.sku
     FROM order_items oi
     JOIN products p ON p.id = oi.product_id
     WHERE oi.order_id = $1`,
    [req.params.id]
  );
  res.render('orders/detail', { order: orderRows[0], items });
});

router.post('/:id/status', async (req, res) => {
  await pool.query('UPDATE orders SET status = $1, updated_at = now() WHERE id = $2', [
    req.body.status,
    req.params.id,
  ]);
  res.redirect('/orders/' + req.params.id);
});

module.exports = router;
