import React, { useEffect, useRef, useState } from 'react';
import LyricsWithAutoScroll from './LyricsWithAutoScroll';
import ParticlesBackground from './ParticlesBackground';
import './App.css'; // For responsive padding

// Helper function to normalize lyrics
const normalizeLyrics = (raw) => {
  if (!raw) return '';
  return raw
    .replace(/(\[.*?\])/g, '\n$1')                    // Line break before [Verse] tags
    .replace(/([।!?])(?=\S)/g, '$1\n')                // Hindi punctuations → new line
    .replace(/(?<=[a-z])(?=[A-Z])/g, '\n')            // camelCase → break
    .replace(/(?<=\S)\s{2,}(?=\S)/g, '\n')            // multiple spaces → newline
    .replace(/\n{2,}/g, '\n')                         // remove excess newlines
    .trim();
};

function App() {
  // Theme state
  const [theme, setTheme] = useState('dark');
  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  // Spotify related states
  const [token, setToken] = useState(null);
  const [track, setTrack] = useState(null);
  const [lyrics, setLyrics] = useState('');
  const [user, setUser] = useState(null);
  const [recentTracks, setRecentTracks] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [devices, setDevices] = useState([]);
  const [activeDevice, setActiveDevice] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const codeHandled = useRef(false);

  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => (res.status === 204 ? null : res.json()))
        .then(data => {
          if (data) {
            if (!track || (data.item && data.item.id !== track?.item?.id)) {
              setTrack(data);
              const name = data.item.name;
              const artist = data.item.artists[0].name;

              fetch(
                `http://localhost:5000/api/lyrics?song=${encodeURIComponent(
                  name
                )}&artist=${encodeURIComponent(artist)}`
              )
                .then(res => res.json())
                .then(lyricsData => {
                  const raw = lyricsData.lyrics || '❌ Lyrics not found.';
                  setLyrics(normalizeLyrics(raw));
                })
                .catch(() => setLyrics('⚠️ Error fetching lyrics.'));
            } else {
              setTrack(prev => ({ ...prev, progress_ms: data.progress_ms }));
            }
          } else {
            setTrack(null);
            setLyrics('');
          }
        })
        .catch(console.error);
    }, 1000);

    return () => clearInterval(interval);
  }, [token, track]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access_token');
    const code = params.get('code');

    if (accessToken) {
      localStorage.setItem('spotify_token', accessToken);
      setToken(accessToken);
      initSpotifyData(accessToken);
      window.history.replaceState({}, document.title, '/');
    } else if (code && !codeHandled.current) {
      codeHandled.current = true;
      window.location.href = `http://127.0.0.1:5000/api/spotify/callback?code=${code}`;
    } else {
      const savedToken = localStorage.getItem('spotify_token');
      if (savedToken) {
        setToken(savedToken);
        initSpotifyData(savedToken);
      }
    }
  }, []);

  const initSpotifyData = (accessToken) => {
    fetchUserProfile(accessToken);
    fetchRecentTracks(accessToken);
    fetchPlaylists(accessToken);
    fetchDevices(accessToken);
  };

  const fetchUserProfile = (accessToken) => {
    fetch('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(res => res.json())
      .then(setUser)
      .catch(console.error);
  };

  const fetchRecentTracks = (accessToken) => {
    fetch('https://api.spotify.com/v1/me/player/recently-played?limit=5', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(res => res.json())
      .then(data => setRecentTracks(data.items || []))
      .catch(console.error);
  };

  const fetchPlaylists = (accessToken) => {
    fetch('https://api.spotify.com/v1/me/playlists', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(res => res.json())
      .then(data => setPlaylists(data.items || []))
      .catch(console.error);
  };

  const fetchDevices = (accessToken) => {
    fetch('https://api.spotify.com/v1/me/player/devices', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then(res => res.json())
      .then(data => {
        setDevices(data.devices || []);
        const active = data.devices.find(d => d.is_active);
        if (active) setActiveDevice(active.id);
        else if (data.devices[0]) setActiveDevice(data.devices[0].id);
      })
      .catch(console.error);
  };

  const handleLogout = () => {
    localStorage.removeItem('spotify_token');
    setToken(null);
    setUser(null);
    setTrack(null);
    setRecentTracks([]);
    setPlaylists([]);
    setDevices([]);
    setActiveDevice(null);
    setErrorMsg('');
  };

  return (
    <>
      {/* Particle background fixed behind content */}
      <ParticlesBackground theme={theme} />

      {/* Main container with relative z-index and responsive class */}
      <div
        className="app-container"
        style={{ position: 'relative', zIndex: 1, ...styles(theme).container }}
      >
        {!token ? (
          <a href="http://127.0.0.1:5000/api/spotify/login">
            <button style={styles(theme).button}>Login with Spotify</button>
          </a>
        ) : (
          <>
            <div style={styles(theme).header}>
              {user && (
                <div style={styles(theme).userProfile}>
                  <h2>👤 {user.display_name}</h2>
                  {user.images?.[0]?.url && (
                    <img
                      src={user.images[0].url}
                      alt="User"
                      width="80"
                      style={styles(theme).image}
                    />
                  )}
                  <p>{user.email}</p>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button onClick={toggleTheme} style={styles(theme).button}>
                  {theme === 'dark' ? '🌞 Light Mode' : '🌙 Dark Mode'}
                </button>
                <button onClick={handleLogout} style={styles(theme).button}>
                  🚪 Logout
                </button>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label>🎧 Select Device: </label>
              <select
                onChange={e => setActiveDevice(e.target.value)}
                value={activeDevice || ''}
                style={styles(theme).select}
              >
                {devices.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name} {d.is_active ? '(Active)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <h2 style={styles(theme).heading}>🎵 Currently Playing</h2>
              {track?.item ? (
                <>
                  <p>
                    <strong>{track.item.name}</strong> —{' '}
                    {track.item.artists.map(a => a.name).join(', ')}
                  </p>
                  <img
                    src={track.item.album.images[0].url}
                    alt="Album"
                    width="200"
                    style={styles(theme).trackImg}
                  />
                </>
              ) : (
                <p>No track is currently playing.</p>
              )}
              {errorMsg && <p style={styles(theme).error}>{errorMsg}</p>}

              {lyrics && track?.item && (
                <LyricsWithAutoScroll
                  rawLyrics={lyrics}
                  progressMs={track.progress_ms || 0}
                  durationMs={track.item.duration_ms || 0}
                  theme={theme} // pass theme for styling inside LyricsWithAutoScroll
                />
              )}
            </div>

            <div style={styles(theme).section}>
              <h2 style={styles(theme).heading}>🕓 Recently Played</h2>
              <ul style={styles(theme).list}>
                {recentTracks.map((item, idx) => (
                  <li key={idx} style={styles(theme).listItem}>
                    {item.track.name} — {item.track.artists.map(a => a.name).join(', ')}
                  </li>
                ))}
              </ul>
            </div>

            <div style={styles(theme).section}>
              <h2 style={styles(theme).heading}>💿 Your Playlists</h2>
              <ul style={styles(theme).list}>
                {playlists.map((pl, idx) => (
                  <li key={idx} style={styles(theme).listItem}>
                    🎧 {pl.name}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default App;

// Dynamic styles function
const styles = (theme) => {
  const isDark = theme === 'dark';

  return {
    container: {
      padding: '2rem',
      fontFamily:
        '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: isDark
        ? 'linear-gradient(160deg, #0d0d0d, #1a1a1a)'
        : 'linear-gradient(160deg, #f5f5f5, #eaeaea)',
      color: isDark ? '#fff' : '#111',
      minHeight: '100vh',
      maxWidth: '1200px',
      margin: '0 auto',
      boxSizing: 'border-box',
      transition: 'background 0.4s ease, color 0.4s ease',
      zIndex: 1,
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2.5rem',
      padding: '1rem 1.5rem',
      backgroundColor: isDark ? 'rgba(40,40,40,0.6)' : 'rgba(255, 255, 255, 0.6)',
      border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0,0,0,0.1)',
      backdropFilter: 'blur(10px)',
      borderRadius: '16px',
      boxShadow: isDark
        ? '0 8px 20px rgba(0, 0, 0, 0.35)'
        : '0 8px 20px rgba(0, 0, 0, 0.1)',
      transition: 'background-color 0.4s ease, border 0.4s ease, box-shadow 0.4s ease',
    },
    userProfile: {
      display: 'flex',
      alignItems: 'center',
      gap: '1.2rem',
    },
    image: {
      borderRadius: '50%',
      width: '72px',
      height: '72px',
      objectFit: 'cover',
      border: '3px solid #1DB954',
      boxShadow: '0 0 15px rgba(29, 185, 84, 0.4)',
      transition: 'transform 0.3s ease',
    },
    select: {
      padding: '0.6rem 1rem',
      fontSize: '1rem',
      backgroundColor: isDark ? '#1e1e1e' : '#fff',
      color: isDark ? '#fff' : '#111',
      border: isDark ? '1px solid #333' : '1px solid #ccc',
      borderRadius: '8px',
      marginLeft: '1rem',
      cursor: 'pointer',
      appearance: 'none',
      backgroundImage: isDark
        ? `url("data:image/svg+xml,%3Csvg fill='white' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`
        : `url("data:image/svg+xml,%3Csvg fill='black' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 0.75rem center',
      backgroundSize: '1rem',
      transition: 'background-color 0.3s ease, color 0.3s ease',
    },
    button: {
      padding: '0.75rem 1.5rem',
      backgroundColor: '#1DB954',
      color: '#ffffff',
      border: 'none',
      borderRadius: '9999px',
      cursor: 'pointer',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      boxShadow: '0 4px 14px rgba(29, 185, 84, 0.5)',
      userSelect: 'none',
    },
    error: {
      color: '#ff4d4d',
      marginTop: '0.75rem',
      fontSize: '0.95rem',
      backgroundColor: 'rgba(255, 77, 77, 0.1)',
      padding: '0.6rem 1rem',
      borderRadius: '6px',
      borderLeft: '4px solid #ff4d4d',
    },
    trackImg: {
      borderRadius: '14px',
      marginTop: '1rem',
      width: '240px',
      boxShadow: isDark
        ? '0 8px 24px rgba(0, 0, 0, 0.45)'
        : '0 8px 24px rgba(0, 0, 0, 0.15)',
      transition: 'transform 0.3s ease',
    },
    section: {
      marginTop: '2rem',
      padding: '1.5rem 1.8rem',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0,0,0,0.03)',
      borderRadius: '18px',
      border: isDark
        ? '1px solid rgba(255, 255, 255, 0.08)'
        : '1px solid rgba(0, 0, 0, 0.1)',
      backdropFilter: 'blur(6px)',
      boxShadow: isDark
        ? '0 6px 20px rgba(0, 0, 0, 0.25)'
        : '0 6px 20px rgba(0, 0, 0, 0.05)',
      transition: 'background-color 0.3s ease',
    },
    heading: {
      fontSize: '1.6rem',
      fontWeight: '700',
      marginBottom: '1rem',
      color: '#1DB954',
      textShadow: '0 0 10px rgba(29, 185, 84, 0.4)',
      userSelect: 'none',
    },
    list: {
      listStyle: 'none',
      padding: 0,
      display: 'grid',
      gap: '0.75rem',
      color: isDark ? '#ddd' : '#222',
    },
    listItem: {
      padding: '0.75rem 1rem',
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0,0,0,0.05)',
      borderRadius: '12px',
      transition: 'all 0.25s ease',
      cursor: 'pointer',
      userSelect: 'none',
    },
  };
};
