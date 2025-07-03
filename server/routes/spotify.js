import express from 'express';
import axios from 'axios';
import dotenv from 'dotenv';
'user-read-playback-state user-modify-playback-state user-read-currently-playing user-read-recently-played playlist-read-private streaming'

dotenv.config();
const router = express.Router();

const REDIRECT_URI = 'http://127.0.0.1:5173'; // ✅ Exact match
 // ✅ Must match Spotify dashboard exactly
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

// ✅ Step 1: Redirect to Spotify for login with all required scopes
router.get('/login', (req, res) => {
  const scope = [
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'user-read-recently-played',
    'playlist-read-private',
    'streaming'
  ].join(' '); // 👈 join array into space-separated string

  const authUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${CLIENT_ID}&scope=${encodeURIComponent(scope)}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
  res.redirect(authUrl);
});


// Step 2: Spotify redirects here with ?code=
router.get('/callback', async (req, res) => {
  const code = req.query.code;
console.log('🔁 Sending token request to Spotify with:');


  try {
    console.log({
  client_id: CLIENT_ID,
  redirect_uri: REDIRECT_URI,
  code
});
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI, // ✅ Must match Spotify redirect URI
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      }
    );

    // ✅ Redirect back to frontend with access token
    res.redirect(`http://127.0.0.1:5173?access_token=${response.data.access_token}`);
  } catch (err) {
    console.error('❌ Token exchange failed:', err.response?.data || err.message);

    res.status(400).json({ error: 'Token exchange failed' });
  }
});

export default router;
