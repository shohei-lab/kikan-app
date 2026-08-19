-- 商品マスタ
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  unit TEXT NOT NULL DEFAULT '個',
  unit_price INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 入出庫トランザクション
CREATE TABLE IF NOT EXISTS stock_transactions (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES products(id),
  type TEXT NOT NULL CHECK (type IN ('in', 'out')),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 在庫残高は保存せず、都度算出するVIEW
CREATE OR REPLACE VIEW stock_balances AS
SELECT
  p.id AS product_id,
  p.sku,
  p.name,
  p.unit,
  COALESCE(SUM(CASE WHEN st.type = 'in' THEN st.quantity ELSE -st.quantity END), 0) AS balance
FROM products p
LEFT JOIN stock_transactions st ON st.product_id = p.id
GROUP BY p.id, p.sku, p.name, p.unit;

-- 受注
CREATE TABLE IF NOT EXISTS orders (
  id SERIAL PRIMARY KEY,
  order_no TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT '受付' CHECK (status IN ('受付', '処理中', '出荷済', 'キャンセル')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 受注明細
CREATE TABLE IF NOT EXISTS order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price_snapshot INTEGER NOT NULL
);
