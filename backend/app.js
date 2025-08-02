const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));

// Database connection
mongoose.connect('mongodb+srv://foodwastedonation:foodwastedonation%40123@foodwaste.wqcwcrk.mongodb.net/productPostDB?retryWrites=true&w=majority&appName=foodwaste');

// Schemas
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
});

const productSchema = new mongoose.Schema({
  name: String,
  description: String,
  image: String,
  userId: String,
});

const User = mongoose.model('User', userSchema);
const Product = mongoose.model('Product', productSchema);

const SECRET = 'jwt_secret_key';

// File upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});
const upload = multer({ storage: storage });

// Auth middleware
function auth(req, res, next) {
  const token = req.headers.authorization;
  try {
    const decoded = jwt.verify(token, SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ msg: 'Invalid token' });
  }
}

// Routes
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: 'User exists' });

    const user = await User.create({ name, email, password });
    const token = jwt.sign({ userId: user._id }, SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch {
    res.status(500).json({ msg: 'Error registering user' });
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });
  if (!user) return res.status(401).json({ msg: 'Invalid credentials' });

  const token = jwt.sign({ userId: user._id }, SECRET, { expiresIn: '1h' });
  res.json({ token });
});

app.get('/products', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

app.get('/user', auth, async (req, res) => {
  const user = await User.findById(req.userId);
  const products = await Product.find({ userId: req.userId });
  res.json({ user, products });
});

app.post('/product', auth, upload.single('image'), async (req, res) => {
  const { name, description } = req.body;
  const imagePath = req.file ? req.file.path : '';

  const product = await Product.create({
    name,
    description,
    image: imagePath,
    userId: req.userId,
  });

  res.json(product);
});

app.put('/product/:id', auth, upload.single('image'), async (req, res) => {
  try {
    const { name, description } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product || product.userId !== req.userId) {
      return res.status(403).json({ msg: 'Unauthorized or product not found' });
    }

    if (req.file) {
      if (product.image && fs.existsSync(product.image)) {
        fs.unlinkSync(product.image);
      }
      product.image = req.file.path;
    }

    product.name = name || product.name;
    product.description = description || product.description;

    await product.save();
    res.json(product);
  } catch (err) {
    res.status(500).json({ msg: 'Update failed' });
  }
});

app.delete('/product/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product || product.userId !== req.userId) {
      return res.status(403).json({ msg: 'Unauthorized or product not found' });
    }

    if (product.image && fs.existsSync(product.image)) {
      fs.unlinkSync(product.image);
    }

    await Product.deleteOne({ _id: req.params.id });

    res.json({ msg: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Delete failed' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});
