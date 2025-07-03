import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import lyricsRoutes from './routes/lyrics.js';
import testRoutes from './routes/test.js';
import spotifyRoutes from './routes/spotify.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;



// Middleware
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.url}`);
  next();
});

// Routes
app.use('/api/lyrics', lyricsRoutes);
app.use('/api/test', testRoutes);
app.use('/api/spotify', spotifyRoutes);

// MongoDB connection
mongoose
  .connect(
    process.env.MONGO_URI ||
      'mongodb+srv://lostfounddb:Lost%401234@cluster0.cy5zk3k.mongodb.net/lostfoundDB?retryWrites=true&w=majority&appName=Cluster0'
  )
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
   app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

  })
  .catch((err) =>
    console.error('❌ MongoDB connection error:', err)
  );
