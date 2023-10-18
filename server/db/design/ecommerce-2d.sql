CREATE TABLE users (
  uuid UUID NOT NULL UNIQUE PRIMARY KEY,
  email VARCHAR NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  first_name VARCHAR NOT NULL,
  last_name VARCHAR NOT NULL,
  phone VARCHAR NOT NULL
);

CREATE TABLE products (
  uuid UUID NOT NULL UNIQUE PRIMARY KEY,
  name VARCHAR NOT NULL UNIQUE,
  category VARCHAR NOT NULL,
  price DECIMAL NOT NULL,
  description VARCHAR NOT NULL,
  designer VARCHAR NOT NULL
);

CREATE TABLE orders (
  uuid UUID NOT NULL UNIQUE PRIMARY KEY,
  created TIMESTAMPTZ NOT NULL,
  modified TIMESTAMPTZ NOT NULL,
  status VARCHAR NOT NULL,
  total_price DECIMAL NOT NULL,
  user_uuid INTEGER NOT NULL,
  FOREIGN KEY (user_uuid) REFERENCES users (uuid)
);

CREATE TABLE order_items (
  uuid UUID NOT NULL UNIQUE PRIMARY KEY,
  order_uuid UUID NOT NULL,
  product_uuid UUID NOT NULL,
  quantity INTEGER NOT NULL,
  price_unit DECIMAL NOT NULL,
  FOREIGN KEY (order_uuid) REFERENCES orders (uuid),
  FOREIGN KEY (product_uuid) REFERENCES products (uuid)
);

CREATE TABLE carts (
  uuid UUID NOT NULL UNIQUE PRIMARY KEY,
  created TIMESTAMPTZ NOT NULL,
  modified TIMESTAMPTZ NOT NULL,
  user_uuid UUID NOT NULL,
  FOREIGN KEY (user_uuid) REFERENCES users (uuid)
);

CREATE TABLE cart_items (
  uuid UUID NOT NULL UNIQUE PRIMARY KEY,
  cart_uuid UUID NOT NULL,
  product_uuid UUID NOT NULL,
  quantity INTEGER NOT NULL,
  FOREIGN KEY (cart_uuid) REFERENCES carts (uuid),
  FOREIGN KEY (product_uuid) REFERENCES products (uuid)
);