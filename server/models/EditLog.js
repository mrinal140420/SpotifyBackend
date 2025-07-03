// models/EditLog.js
import mongoose from 'mongoose';

const editLogSchema = new mongoose.Schema({
  songId: String,
  editedBy: String,
  timestamp: { type: Date, default: Date.now },
  changes: String,
});

const EditLog = mongoose.model('EditLog', editLogSchema);

export default EditLog;
