import express from 'express';
const router = express.Router();

// Dummy test route
router.get('/test', (req, res) => {
  res.json({ message: '🎵 Lyrics API is working!' });
});

export default router;
