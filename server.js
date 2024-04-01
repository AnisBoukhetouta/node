// importing required packages
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const File = require("./models/fileModel.js");

const multer = require("multer");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const port = process.env.PORT || 5000;
// init express node app
const app = express();

// allow the app to use middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});
app.use("/", authRoutes);

//====================Middleware to parse JSON and urlencoded form data====================
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: function (req, file, cb) {
    cb(null, file.fieldname + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });
//====================Route to handle form submission====================

// connect the app to a database
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    app.listen(port, () => {
      console.log("connected to db and server started on", port);
    });
  })
  .catch((error) => {
    console.log(error);
  });

app.post(
  "/upload",
  upload.fields([
    { name: "fileUpload" },
    { name: "landscapeFile" },
    { name: "portraitFile" },
    { name: "squareFile" },
  ]),
  async (req, res) => {
    // const {name, email} = req.body;
    try {
      const files = [];

      for (const fieldName of Object.keys(req.files)) {
        for (const file of req.files[fieldName]) {
          const savedFile = await File.create({
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

    console.log("Received form data:", req.body);
    console.log("~~~~~~~~~REQ~~~ :", req.files);
    // res.send("Form data received successfully.");
  }
);
