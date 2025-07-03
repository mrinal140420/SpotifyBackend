exports.editLyrics = async (req, res) => {
  try {
    const { songId } = req.params;
    const { editedBy, changes } = req.body;

    const log = new EditLog({ songId, editedBy, changes });
    await log.save();

    res.send("Lyrics updated and logged in DB");
  } catch (err) {
    console.error("Edit failed:", err);
    res.status(500).send("Server error");
  }
};
