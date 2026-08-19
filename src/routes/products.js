const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

router.get('/', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM products ORDER BY id');
  res.render('products/list', { products: rows });
});

router.get('/new', (req, res) => {
  res.render('products/form', { product: null, error: null });
});

router.post('/', async (req, res) => {
  const { sku, name, unit, unit_price } = req.body;
  try {
    await pool.query(
      'INSERT INTO products (sku, name, unit, unit_price) VALUES ($1, $2, $3, $4)',
      [sku, name, unit || '個', Number(unit_price) || 0]
    );
    res.redirect('/products');
  } catch (err) {
    res.render('products/form', { product: req.body, error: 'SKUが重複しているか、入力に誤りがあります' });
  }
});

router.get('/:id/edit', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
  if (!rows[0]) return res.redirect('/products');
  res.render('products/form', { product: rows[0], error: null });
});

router.post('/:id', async (req, res) => {
  const { sku, name, unit, unit_price } = req.body;
  try {
    await pool.query(
      'UPDATE products SET sku = $1, name = $2, unit = $3, unit_price = $4, updated_at = now() WHERE id = $5',
      [sku, name, unit || '個', Number(unit_price) || 0, req.params.id]
    );
    res.redirect('/products');
  } catch (err) {
    res.render('products/form', {
      product: { ...req.body, id: req.params.id },
      error: 'SKUが重複しているか、入力に誤りがあります',
    });
  }
});

module.exports = router;
