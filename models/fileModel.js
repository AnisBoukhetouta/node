const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  gameTitle: String,
  category: String,
  tags: String,
  gameType: String,
  fieldName: String,
  originalName: String,
  enCoding: String,
  mimeType: String,
  destination: String,
  fileName: String,
  path: String,
  size: String,
});

const File = mongoose.model("File", fileSchema);

module.exports = File;
