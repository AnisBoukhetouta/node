const mongoose = require("mongoose");

const userInfoSchema = new mongoose.Schema({
  email: String,
  creationTime: String,
  lastSignInTime: String,
  uid: String,
  providerId: String,
  accessToken: String,
  refreshToken: String,
});

const UserInfo = mongoose.model("UserInfo", userInfoSchema);

module.exports = UserInfo;
