import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// ✅ This must match your Spotify dashboard redirect URI
const REDIRECT_URI = 'https://spotifybackend-knuc.onrender.com/api/spotify/callback';
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

// ✅ Step 1: Redirect user to Spotify login with scopes
router.get('/login', (req, res) => {
  const scope = [
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'user-read-recently-played',
    'playlist-read-private',
    'streaming'
  ].join(' ');

  const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${CLIENT_ID}&scope=${encodeURIComponent(
    scope
  )}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;

  res.redirect(authUrl);
});

// ✅ Step 2: Spotify redirects here with ?code=...
router.get('/callback', async (req, res) => {
  const code = req.query.code;

  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      }
    );

    const access_token = response.data.access_token;

    // ✅ Redirect to frontend with token (use your GitHub Pages or localhost here)
    res.redirect(`https://mrinal140420.github.io/spotifyFrontend/?access_token=${access_token}`);
    // Or during local development: http://localhost:5173/?access_token=...
  } catch (err) {
    console.error('❌ Token exchange failed:', err.response?.data || err.message);
    res.status(400).json({ error: 'Token exchange failed' });
  }
});

export default router;
