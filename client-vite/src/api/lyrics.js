const BASE_URL = "/api/lyrics";


export async function fetchLyrics(songId) {
  const res = await fetch(`${BASE_URL}/${songId}`);
  return res.json();
}

export async function editLyrics(songId, editedBy, changes) {
  const res = await fetch(`${BASE_URL}/${songId}/edit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ editedBy, changes })
  });
  return res.json();
}
