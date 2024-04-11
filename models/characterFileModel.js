const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  fieldName: String,
  originalName: String,
  enCoding: String,
  mimeType: String,
  destination: String,
  fileName: String,
  path: String,
  size: String,
});

const CharacterFile = mongoose.model("CharacterFile", fileSchema);

module.exports = CharacterFile;
