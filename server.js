const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files (HTML, CSS, JS, images)
app.use(express.static(__dirname));

const adminUsername = 'admin';
const adminPassword = 'admin123';
const adminEmail = 'admin@webshop.com';

// Database file path
const db = new sqlite3.Database('webshop.db');

// Create tables if they don't exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    märke TEXT NOT NULL,
    smak TEXT NOT NULL,
    kategori TEXT NOT NULL,
    storlek TEXT NOT NULL,
    price REAL NOT NULL,
    bild TEXT
  )`);


  db.get('SELECT COUNT(*) AS count FROM products', (err, row) => {
   if (err) {
      console.error('Error checking products table:', err);
      return;
    }
   if (row.count === 0) {
      const fs = require('fs');
      const snacks = JSON.parse(fs.readFileSync(path.join(__dirname, 'snacks.json'), 'utf8'));
      snacks.chips.forEach(chip => {
        db.run(
          `INSERT INTO products (märke, smak, kategori, storlek, price, bild) VALUES (?, ?, ?, ?, ?, ?)`,
          [chip.märke, chip.smak, chip.kategori, chip.storlek, chip.price, chip.bild]
        );
     });
      console.log('Imported chips from snacks.json');
    }
    });

  // Ensure admin user exists

  db.get('SELECT * FROM users WHERE username = ?', [adminUsername], (err, user) => {
    if (err) {
      console.error('Error checking for admin user:', err);
      return;
    }
    if (!user) {
      db.run(
        'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
        [adminUsername, adminPassword, adminEmail],
        (err) => {
          if (err) {
            console.error('Error creating admin user:', err);
          } else {
            console.log('Admin user created.');
          }
        }
      );
    } else {
      console.log('Admin user already exists.');
    }
  });
});


app.use(express.json({limit: '1mb'}));

// Serve index.html for the root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// User sign up
app.post('/signup', (req, res) => {
  const { username, password, email } = req.body;
  if (!username || !password || !email) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const sql = 'INSERT INTO users (username, password, email) VALUES (?, ?, ?)';
  db.run(sql, [username, password, email], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        return res.status(409).json({ error: 'Username or email already exists' });
      }
      return res.status(500).json({ error: 'Failed to create user' });
    }
    res.status(201).json({ id: this.lastID });
  });
});

// User log in
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const sql = 'SELECT * FROM users WHERE username = ? AND password = ?';
  db.get(sql, [username, password], (err, user) => {
    if (err) return res.status(500).json({ error: 'Failed to log in' });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const isAdmin = user.username === 'admin';
    res.json({ id: user.id, username: user.username, email: user.email, isAdmin });
  });
});

// List all products
app.get('/products', (req, res) => {
  const sql = 'SELECT * FROM products';
  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch products' });
    res.json(rows);
  });
});


// Add a product (with PNG upload to Img folder)
app.post('/products', (req, res) => {
  const { märke, smak, kategori, storlek, price, bild } = req.body;
  if (!märke || !smak || !kategori || !storlek || !price || !bild) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  // Save PNG to Img folder
  const matches = bild.match(/^data:image\/png;base64,(.+)$/);
  if (!matches) {
    return res.status(400).json({ error: 'Invalid image format' });
  }
  const base64Data = matches[1];
  const filename = `product_${Date.now()}_${Math.floor(Math.random()*10000)}.png`;
  const filePath = path.join(__dirname, 'Img', filename);
  const fileDbPath = `Img/${filename}`;
  const fs = require('fs');
  fs.writeFile(filePath, base64Data, 'base64', (err) => {
    if (err) return res.status(500).json({ error: 'Failed to save image' });
    // Insert product into DB
    const sql = `INSERT INTO products (märke, smak, kategori, storlek, price, bild) VALUES (?, ?, ?, ?, ?, ?)`;
    db.run(sql, [märke, smak, kategori, storlek, price, fileDbPath], function(err) {
      if (err) return res.status(500).json({ error: 'Failed to add product' });
      res.status(201).json({ id: this.lastID });
    });
  });
});

// Update a product
app.put('/products/:id', (req, res) => {
  const id = req.params.id;
  const { name, description, price, stock } = req.body;
  const sql = `UPDATE products SET name = ?, description = ?, price = ?, stock = ? WHERE id = ?`;
  db.run(sql, [name, description, price, stock, id], function(err) {
    if (err) return res.status(500).json({ error: 'Failed to update product' });
    if (this.changes === 0) return res.status(404).json({ error: 'Product not found' });
    res.json({ updated: true });
  });
});

// Delete a product
app.delete('/products/:id', (req, res) => {
  const id = req.params.id;
  const sql = `DELETE FROM products WHERE id = ?`;
  db.run(sql, [id], function(err) {
    if (err) return res.status(500).json({ error: 'Failed to delete product' });
    if (this.changes === 0) return res.status(404).json({ error: 'Product not found' });
    res.json({ deleted: true });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
