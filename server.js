require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const File = require("./models/fileModel.js");
const fs = require("fs");
const multer = require("multer");
const cors = require("cors");
const port = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

// Serve static files from the 'uploads' directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const folderPath = `uploads/${req.body.gameTitle}`;
    fs.mkdirSync(folderPath, { recursive: true });
    cb(null, folderPath);
  },
  filename: function (req, file, cb) {
    const extension = path.extname(file.originalname);
    cb(null, `${file.fieldname}${extension}`);
  },
});
const upload = multer({ storage: storage });

app.get("/files", async (req, res) => {
  try {
    let query = {};
    if (req.query.gameTitle) {
      query.gameTitle = req.query.gameTitle;
    }
    const files = await File.aggregate([
      {
        $match: query,
      },
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
});

app.post(
  "/upload",
  upload.fields([
    { name: "landscapeFile" },
    { name: "portraitFile" },
    { name: "squareFile" },
    { name: "fileUpload0" },
    { name: "fileUpload1" },
    { name: "fileUpload2" },
    { name: "fileUpload3" },
  ]),
  async (req, res) => {
    try {
      // Validate request body
      const { gameTitle, category, tags, description, controls, gameType } =
        req.body;
      if (
        !gameTitle ||
        !category ||
        !tags ||
        !description ||
        !controls ||
        !gameType
      ) {
        return res
          .status(400)
          .json({ message: "Missing required fields in request body." });
      }

      const files = [];

      console.log("~~~~~~~~~~", req.files);
      for (const fieldName of Object.keys(req.files)) {
        for (const file of req.files[fieldName]) {
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
      }
      res.json({ files });
    } catch (error) {
      console.error("Error saving files:", error);
      res.status(500).send("Server error.");
    }
  }
);

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(port, () => {
      console.log("Server started on port", port);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });
