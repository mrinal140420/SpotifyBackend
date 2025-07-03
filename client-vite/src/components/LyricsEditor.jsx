import { useState } from "react";
import { editLyrics } from "../api/lyrics";

export default function LyricsEditor({ songId }) {
  const [editedBy, setEditedBy] = useState("");
  const [changes, setChanges] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await editLyrics(songId, editedBy, changes);
    alert(res.message || "Edit submitted!");
    setChanges("");
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 p-4 rounded">
      <h2 className="text-xl font-semibold mb-2">Edit Lyrics</h2>
      <input
        className="w-full mb-2 p-2 text-black"
        placeholder="Your name"
        value={editedBy}
        onChange={(e) => setEditedBy(e.target.value)}
        required
      />
      <textarea
        className="w-full mb-2 p-2 text-black"
        placeholder="Describe your change"
        value={changes}
        onChange={(e) => setChanges(e.target.value)}
        rows={4}
        required
      />
      <button type="submit" className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600">
        Submit Edit
      </button>
    </form>
  );
}
