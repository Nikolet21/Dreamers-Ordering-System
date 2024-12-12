import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import admin from 'firebase-admin';
import { readFile } from 'fs/promises';
import path from 'path';
import process from 'process';

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

// Menu route
app.get('/api/menu', async (req, res) => {
  try {
    console.log('Attempting to fetch menu data from Firestore...');
    const snapshot = await admin.firestore().collection('menu').get();
    console.log(`Successfully retrieved ${snapshot.size} menu items`);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(data);
  } catch (error) {
    console.error('Error fetching menu data:', error);
    res.status(500).json({
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Reviews routes
app.get('/api/reviews', async (req, res) => {
  try {
    console.log('Fetching reviews from Firestore...');
    const reviewsRef = admin.firestore().collection('reviews');
    const snapshot = await reviewsRef.orderBy('date', 'desc').get();

    console.log('Reviews snapshot size:', snapshot.size); // Debug log

    const reviews = snapshot.docs.map(doc => {
      const data = doc.data();
      console.log('Review data:', data); // Debug log
      return {
        id: doc.id,
        ...data,
        date: data.date ? data.date.toDate() : new Date()
      };
    });

    console.log('Processed reviews:', reviews); // Debug log
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/reviews', async (req, res) => {
  try {
    console.log('Received review submission:', req.body); // Debug log

    // Create review data with current timestamp
    const reviewData = {
      ...req.body,
      date: admin.firestore.Timestamp.now(),
      isRead: false
    };

    console.log('Processed review data:', reviewData); // Debug log

    // Add to Firestore
    const reviewsRef = admin.firestore().collection('reviews');
    const docRef = await reviewsRef.add(reviewData);

    // Get the created document
    const doc = await docRef.get();
    const responseData = {
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate()
    };

    console.log('Created review:', responseData); // Debug log
    res.status(201).json(responseData);
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/reviews/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await admin.firestore().collection('reviews').doc(id).update(req.body);

    const doc = await admin.firestore().collection('reviews').doc(id).get();
    res.json({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate()
    });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/reviews/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await admin.firestore().collection('reviews').doc(id).delete();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
