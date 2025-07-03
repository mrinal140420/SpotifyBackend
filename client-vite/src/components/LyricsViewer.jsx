import { useEffect, useState } from "react";
import { fetchLyrics } from "../api/lyrics";

export default function LyricsViewer({ songId }) {
  const [lyrics, setLyrics] = useState("");

  useEffect(() => {
    fetchLyrics(songId).then(data => setLyrics(data.lyrics));
  }, [songId]);

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-2">Lyrics</h2>
      <pre className="bg-gray-800 p-4 rounded">{lyrics}</pre>
    </div>
  );
}
