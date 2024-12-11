import { admin } from '../config/firebase-config.js';

export const verifyToken = async (req, res, next) => {
  try {
    // Extract token from Authorization header or query parameter
    const token =
      req.headers.authorization?.split('Bearer ')[1] || req.query.token;

    if (!token) {
      return res
        .status(401)
        .json({ error: 'No token provided in Authorization header or query parameter' });
    }

    // Verify the token using Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Check if the token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (decodedToken.exp < currentTime) {
      return res.status(401).json({ error: 'Token has expired' });
    }

    // Attach the decoded token to the request object
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Error verifying token:', error.message); // Log for debugging
    res
      .status(401)
      .json({ error: 'Invalid or expired token', details: error.message });
  }
};
