// Import required packages
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const File = require("./models/fileModel.js");
const fs = require("fs");
const multer = require("multer");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const port = process.env.PORT || 5000;

// Initialize express app
const app = express();

// Allow the app to use middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});
app.use("/", authRoutes);

// Middleware to parse JSON and urlencoded form data
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const folderPath = `uploads/${req.body.gameTitle}`;
    fs.mkdirSync(folderPath, { recursive: true });
    cb(null, folderPath);
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    // Start the server after connecting to MongoDB
    app.listen(port, () => {
      console.log("Server started on port", port);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
  });

// Route to retrieve files from MongoDB
app.get("/files", async (req, res) => {
  try {
    // Retrieve all files from MongoDB
    // const files = await File.find();
    // Send the files as JSON response

    const files = await File.aggregate([
      {
        $group: {
          title: "$gameTitle", // Group by the gameTitle field
          files: { $push: "$$ROOT" }, // Push documents into the files array for each group
        },
      },
    ]);

    res.json(files);
  } catch (error) {
    console.error("Error retrieving files:", error);
    res.status(500).send("Server error.");
  }
});

// Route to handle file uploads
app.post(
  "/upload",
  upload.fields([
    { name: "fileUpload" },
    { name: "landscapeFile" },
    { name: "portraitFile" },
    { name: "squareFile" },
  ]),
  async (req, res) => {
    try {
      const files = [];

      for (const fieldName of Object.keys(req.files)) {
        for (const file of req.files[fieldName]) {
          const savedFile = await File.create({
            gameTitle: req.body.gameTitle,
            category: req.body.category,
            tags: req.body.tags,
            description: req.body.description,
            controls: req.body.controls,
            gameType: req.body.gameType,
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
