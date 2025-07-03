// controllers/lyricsController.js
import EditLog from '../models/EditLog.js';

export const getLyrics = async (req, res) => {
  const { songId } = req.params;
  // Placeholder: fetch lyrics from DB or static file
  res.send({ songId, lyrics: "Example lyrics..." });
};

export const editLyrics = async (req, res) => {
  const { songId } = req.params;
  const { editedBy, changes } = req.body;

  try {
    const log = new EditLog({ songId, editedBy, changes });
    await log.save();
    res.send({ success: true, message: "Edit logged" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
