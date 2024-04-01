const Auth = require("../models/authModel");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: "3d" });
};

const upLoad = async (req, res) => {
  const { username, password } = req.body;
  try {
    const auth = await Auth.login(username, password);
    const token = createToken(auth._id);
    res.status(200).json({ username, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const downLoad = async (req, res) => {
    const { username, password } = req.body;
    try {
      const auth = await Auth.signup(username, password);
      const token = createToken(auth._id);
      res.status(200).json({ username, token });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

module.exports = {
    upLoad,
    downLoad,
  };