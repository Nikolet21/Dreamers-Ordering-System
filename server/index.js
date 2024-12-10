import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { db } from './config/firebase-config.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes

// Get all menu items
app.get('/api/menu', async (req, res) => {
  try {
    const menuSnapshot = await db.collection('menu').get();
    const menuItems = [];
    menuSnapshot.forEach(doc => {
      menuItems.push({ id: doc.id, ...doc.data() });
    });
    res.json(menuItems);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

// Create new order
app.post('/api/orders', async (req, res) => {
  try {
    const { items, totalAmount, customerName, status = 'pending' } = req.body;
    const orderData = {
      items,
      totalAmount,
      customerName,
      status,
      createdAt: new Date().toISOString(),
    };
    
    const orderRef = await db.collection('orders').add(orderData);
    res.status(201).json({ id: orderRef.id, ...orderData });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Get order by ID
app.get('/api/orders/:orderId', async (req, res) => {
  try {
    const orderDoc = await db.collection('orders').doc(req.params.orderId).get();
    if (!orderDoc.exists) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json({ id: orderDoc.id, ...orderDoc.data() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order' });
  }
});

// Update order status
app.patch('/api/orders/:orderId', async (req, res) => {
  try {
    const { status } = req.body;
    await db.collection('orders').doc(req.params.orderId).update({ status });
    res.json({ message: 'Order updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update order' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
