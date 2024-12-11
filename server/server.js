import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import admin from 'firebase-admin';
import { readFile } from 'fs/promises';
import path from 'path';
import process from 'process';

// Read JSON file dynamically
const serviceAccountKey = JSON.parse(
  await readFile(
    path.resolve('./server/serviceAccountKey.json'),
    'utf8'
  )
);

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey)
});

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Example route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is working!' });
});

// Firestore example route
app.get('/api/menu', async (req, res) => {
  try {
    const snapshot = await admin.firestore().collection('menu').get();
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
