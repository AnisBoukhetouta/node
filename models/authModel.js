const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");

const Schema = mongoose.Schema;

const authSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

//static signup method
authSchema.statics.signup = async function (username, password) {
  if (!username || !password) {
    throw Error("All fields must be filled");
  }

  if (!validator.isEmail(username)) {
    throw Error("Email is not valid");
  }
  if (!validator.isStrongPassword(password)) {
    throw Error("Password is not strong");
  }

  const exists = await this.findOne({ username });

  if (exists) {
    throw Error("Auth already exists");
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  const auth = await this.create({ username, password: hash });

  return auth;
};

//static login method
authSchema.statics.login = async function (username, password) {
  if (!username || !password) {
    throw Error("All fields must be filled");
  }

  const auth = await this.findOne({ username });

  if (!auth) {
    throw Error("Incorrect Email");
  }

  const match = await bcrypt.compare(password, auth.password);

  if (!match) {
    throw Error("Incorrect Password");
  }

  return auth;
};

module.exports = mongoose.model("Auth", authSchema);
