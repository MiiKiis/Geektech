CREATE TABLE IF NOT EXISTS settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(50) UNIQUE NOT NULL,
    value NUMERIC(10, 2) NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS productos (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price_usd NUMERIC(10, 2) NOT NULL,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertamos la tasa inicial (Ej: 1 USD = 36.5 Bs)
INSERT INTO settings (key, value) VALUES ('usd_to_bs', 36.5) ON CONFLICT (key) DO NOTHING;

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    total_usd NUMERIC(10, 2) NOT NULL,
    total_bs NUMERIC(15, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pendiente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    producto_id INTEGER REFERENCES productos(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    price_usd NUMERIC(10, 2) NOT NULL
);

-- Usuario Administrador por defecto
INSERT INTO users (name, email, password, role) 
VALUES ('miikiis', 'crisjafeth16@gmail.com', '$2b$10$DxWb6z70wsX/oF/bADGC2eeEwUMYFO/aEj9Fb6E66QhdCJzhoxDAy', 'admin')
ON CONFLICT (email) DO NOTHING;
