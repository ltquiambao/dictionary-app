const mongoose = require("mongoose");

const DictRefSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },
  stems: [String],
  sort: String,
  shortdef: [String],
  def: [String],
  art: {
    artid: String,
    capt: String,
    arturl: String,
  },

  cachedDate: Date,
});

module.exports = mongoose.model("DictRef", DictRefSchema);
