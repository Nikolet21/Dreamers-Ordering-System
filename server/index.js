import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { db } from './config/firebase-config.js';
import { verifyToken } from './middleware/auth.js';
import process from 'process';
import admin from './config/firebase-admin.js'; // Import Firebase Admin SDK

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'your-production-domain.com' 
    : 'http://localhost:3000'
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Logging middleware
app.use(morgan('dev'));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
// Public routes
app.get('/api/menu', async (req, res) => {
  try {
    const menuSnapshot = await db.collection('menu').get();
    const menuItems = [];
    menuSnapshot.forEach(doc => {
      menuItems.push({ id: doc.id, ...doc.data() });
    });
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch menu items', details: error.message });
  }
});

// Protected routes
app.post('/api/orders', verifyToken, async (req, res) => {
  try {
    const { items, totalAmount, customerName, status = 'pending' } = req.body;
    const orderData = {
      items,
      totalAmount,
      customerName,
      status,
      userId: req.user.uid, // From verified token
      createdAt: new Date().toISOString(),
    };
    
    const orderRef = await db.collection('orders').add(orderData);
    res.status(201).json({ id: orderRef.id, ...orderData });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create order', details: error.message });
  }
});

app.get('/api/orders/:orderId', async (req, res) => {
  try {
    const orderDoc = await db.collection('orders').doc(req.params.orderId).get();
    if (!orderDoc.exists) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ id: orderDoc.id, ...orderDoc.data() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order', details: error.message });
  }
});

app.patch('/api/orders/:orderId', verifyToken, async (req, res) => {
  try {
    const { status } = req.body;
    await db.collection('orders').doc(req.params.orderId).update({ status });
    res.json({ message: 'Order updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order', details: error.message });
  }
});

// User Account Routes
app.post('/api/users', async (req, res) => {
  try {
    const { email, password, username, role = 'user' } = req.body;
    
    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: username
    });

    // Store additional user data in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      username,
      email,
      role,
      createdAt: new Date().toISOString()
    });

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user', details: error.message });
  }
});

app.get('/api/users', verifyToken, async (req, res) => {
  try {
    const usersSnapshot = await db.collection('users').get();
    const users = [];
    usersSnapshot.forEach(doc => {
      users.push({ id: doc.id, ...doc.data() });
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users', details: error.message });
  }
});

app.get('/api/users/:userId', verifyToken, async (req, res) => {
  try {
    const userDoc = await db.collection('users').doc(req.params.userId).get();
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ id: userDoc.id, ...userDoc.data() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user', details: error.message });
  }
});

app.patch('/api/users/:userId', verifyToken, async (req, res) => {
  try {
    const { username, role } = req.body;
    const updates = {};
    
    if (username) updates.username = username;
    if (role) updates.role = role;
    
    await db.collection('users').doc(req.params.userId).update(updates);
    
    if (username) {
      await admin.auth().updateUser(req.params.userId, {
        displayName: username
      });
    }
    
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user', details: error.message });
  }
});

app.delete('/api/users/:userId', verifyToken, async (req, res) => {
  try {
    // Delete from Firebase Auth
    await admin.auth().deleteUser(req.params.userId);
    // Delete from Firestore
    await db.collection('users').doc(req.params.userId).delete();
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user', details: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!', details: err.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
