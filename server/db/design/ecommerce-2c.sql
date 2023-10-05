CREATE TABLE users (
    uuid UUID NOT NULL UNIQUE PRIMARY KEY,
    email VARCHAR NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    first_name VARCHAR NOT NULL,
    last_name VARCHAR NOT NULL,
    phone VARCHAR NOT NULL
);

CREATE TABLE products (
    uuid UUID(36) NOT NULL UNIQUE PRIMARY KEY,
    name VARCHAR NOT NULL UNIQUE,
    category VARCHAR NOT NULL,
    price DECIMAL NOT NULL,
    description VARCHAR NOT NULL,
    designer VARCHAR NOT NULL
);

CREATE TABLE orders (
    uuid UUID NOT NULL UNIQUE PRIMARY KEY DEFAULT uuid_generate_v4(),
    created DATE NOT NULL,
    modified DATE NOT NULL,
    status VARCHAR NOT NULL,
    total_price DECIMAL NOT NULL,
    user_uuid INTEGER NOT NULL REFERENCES users(uuid) ON DELETE CASCADE
);

CREATE TABLE order_items (
    uuid UUID NOT NULL UNIQUE PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_uuid UUID NOT NULL REFERENCES orders(uuid) ON DELETE CASCADE,
    product_uuid UUID NOT NULL REFERENCES products(uuid) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    price_unit DECIMAL NOT NULL
);

CREATE TABLE carts (
    uuid UUID NOT NULL UNIQUE PRIMARY KEY DEFAULT uuid_generate_v4(),
    created DATE NOT NULL,
    modified DATE NOT NULL,
    user_uuid UUID NOT NULL REFERENCES users(uuid) ON DELETE CASCADE
);

CREATE TABLE cart_items (
    uuid UUID NOT NULL UNIQUE PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_uuid UUID NOT NULL REFERENCES carts(uuid) ON DELETE CASCADE,
    product_uuid UUID NOT NULL REFERENCES products(uuid) ON DELETE CASCADE,
    quantity INTEGER NOT NULL
);