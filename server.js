require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const cors = require("cors");

const File = require("./models/fileModel");
const UserInfo = require("./models/userInfoModel");

const app = express();
const port = process.env.PORT || 4003;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "uploads")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folderPath = `uploads/${req.body.gameTitle}`;
    fs.mkdirSync(folderPath, { recursive: true });
    cb(null, folderPath);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    cb(null, `${file.fieldname}${extension}`);
  },
});
const upload = multer({ storage });

// Routes
app.get("/api/pwniq/files", getFiles);
app.post("/api/pwniq/upload", upload.array("files"), uploadFiles);
app.post("/api/pwniq/userInfo", createUserInfo);

// Route Handlers
async function getFiles(req, res) {
  try {
    const query = req.query.gameTitle ? { gameTitle: req.query.gameTitle } : {};
    const files = await File.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$gameTitle",
          files: { $push: "$$ROOT" },
        },
      },
    ]);
    res.json(files);
  } catch (error) {
    console.error("Error retrieving files:", error);
    res.status(500).send("Server error.");
  }
}

async function uploadFiles(req, res) {
  try {
    const { gameTitle, category, tags, description, controls, gameType } = req.body;
    if (!gameTitle || !category || !tags || !description || !controls || !gameType) {
      return res.status(400).json({ message: "Missing required fields in request body." });
    }

    const files = [];
    for (let file of req.files) {
      const savedFile = await File.create({
        gameTitle,
        category,
        tags,
        description,
        controls,
        gameType,
        fieldName: file.fieldname,
        originalName: file.originalname,
        enCoding: file.encoding,
        mimeType: file.mimetype,
        destination: file.destination,
        fileName: file.filename,
        path: file.path,
        size: file.size,
      });
      files.push(savedFile);
    }
    res.json(files);
  } catch (error) {
    console.error("Error saving files:", error);
    res.status(500).send("Server error.");
  }
}

async function createUserInfo(req, res) {
  try {
    const { email, creationTime, lastSignInTime, uid, providerId, localId, accessToken, refreshToken } = req.body;
    if (!email || !creationTime || !lastSignInTime || !uid || !accessToken) {
      return res.status(400).json({ message: "Missing required fields in request body." });
    }
    const newUser = await UserInfo.create({
      email,
      creationTime,
      lastSignInTime,
      uid,
      providerId,
      localId,
      accessToken,
      refreshToken,
    });
    res.status(201).json({ message: "User created successfully", user: newUser });
  } catch (error) {
    console.error("Error creating user info:", error);
    res.status(500).send("Server error.");
  }
}

// Start the server
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(port, () => {
      console.log("Server started on port", port);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });
