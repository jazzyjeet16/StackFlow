
const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

// Database directory
const dbDirectory = path.dirname(
    process.env.DATABASE_PATH || "./database/stockflow.db"
);

// Create directory if it doesn't exist
if (!fs.existsSync(dbDirectory)) {
    fs.mkdirSync(dbDirectory, { recursive: true });
}

// Database connection
const db = new Database(
    process.env.DATABASE_PATH || "./database/stockflow.db"
);

// Enable foreign keys
db.pragma("foreign_keys = ON");

// Organizations table
db.exec(`
    CREATE TABLE IF NOT EXISTS organizations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        default_low_stock_threshold INTEGER DEFAULT 5,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`);

// Users table
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        organization_id INTEGER NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (organization_id)
        REFERENCES organizations(id)
        ON DELETE CASCADE
    );
`);

// Products table
db.exec(`
    CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        organization_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        sku TEXT NOT NULL,
        description TEXT,
        quantity INTEGER NOT NULL DEFAULT 0,
        cost_price REAL,
        selling_price REAL,
        low_stock_threshold INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (organization_id)
        REFERENCES organizations(id)
        ON DELETE CASCADE,

        UNIQUE (organization_id, sku),

        CHECK (quantity >= 0),
        CHECK (cost_price IS NULL OR cost_price >= 0),
        CHECK (selling_price IS NULL OR selling_price >= 0),
        CHECK (
            low_stock_threshold IS NULL
            OR low_stock_threshold >= 0
        )
    );
`);

console.log("SQLite database connected successfully");

module.exports = db;
