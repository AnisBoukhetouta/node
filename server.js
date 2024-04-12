require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const cors = require("cors");

const File = require("./models/fileModel");
const UserInfo = require("./models/userInfoModel");
const CharacterFile = require("./models/characterFileModel");

const app = express();
const port = process.env.PORT || 4003;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(express.static(path.join(__dirname, "uploads")));
app.use("/api/pwniq/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/pwniq/glbFiles", express.static(path.join(__dirname, "glbFiles")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('VVVVVVVVVVVVVVVVVV')
    const folderPath = `uploads/${req.body.gameTitle}`;
    fs.mkdirSync(folderPath, { recursive: true });
    cb(null, folderPath);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    cb(null, `${file.fieldname}${extension}`);
  },
});
const characterStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const destination = "glbFiles"; // Define the destination directory here
    fs.mkdirSync(destination, { recursive: true });
    cb(null, destination);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    cb(null, `${file.fieldname}${extension}`);
  },
});
const upload = multer({ storage });
const characterUpload = multer({ storage: characterStorage });

// Routes
app.get("/api/pwniq/files", getFiles);
// app.post("/api/pwniq/upload", upload.array("files"), uploadFiles);
app.post(
  "/api/pwniq/characterFileUpload",
  characterUpload.single("characterFileUpload"),
  uploadCharacterFile
);
app.get("/api/pwniq/characterFiles", getCharacterFiles);
// app.post("/api/pwniq/userInfo", createUserInfo);

// Route Handlers

app.post(
  "/api/pwniq/upload",
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

      var files = [];

      console.log("~~~~~~~~~~", req.files);
      for (let fieldName of Object.keys(req.files)) {
          console.log("???????????????????????", fieldName);
          for (let file of req.files[fieldName]) {
          console.log("!!!!!!!!!!!!!!!!!!!!!!!", file);
          let savedFile = await File.create({
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
          console.log("````````````````````", files);
        }
      }
      console.log("@@@@@@@@@@@@@");
      res.json(files);
    } catch (error) {
      console.error("Error saving files:", error);
      res.status(500).send("Server error.");
    }
  }
);

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
  } catch (e) {
    console.log("Error retrieving files:", e);
    res.status(500).send("Server error.");
  }
}

async function getCharacterFiles(req, res) {
  try {
    const query = req.query.uid;
    if (!query) {
      return res
        .status(400)
        .json({ message: "Missing required fields in request body." });
    }
    const characterFileModel = await CharacterFile.findOne({ userId: query });
    console.log("~~~~~~~~~~~~~~~", characterFileModel);
    res.json(characterFileModel);
  } catch (e) {
    console.error("Error retrieving files:", e);
    res.status(500).send("Server error.");
  }
}

// async function uploadFiles(req, res) {
//   try {
//     const { gameTitle, category, tags, description, controls, gameType } =
//       req.body;
//     if (
//       !gameTitle ||
//       !category ||
//       !tags ||
//       !description ||
//       !controls ||
//       !gameType
//     ) {
//       return res
//         .status(400)
//         .json({ message: "Missing required fields in request body." });
//     }

//     const files = [];
//     for (let file of req.files) {
//       const savedFile = await File.create({
//         gameTitle,
//         category,
//         tags,
//         description,
//         controls,
//         gameType,
//         fieldName: file.fieldname,
//         originalName: file.originalname,
//         enCoding: file.encoding,
//         mimeType: file.mimetype,
//         destination: file.destination,
//         fileName: file.filename,
//         path: file.path,
//         size: file.size,
//       });
//       files.push(savedFile);
//     }
//     res.json(files);
//   } catch (error) {
//     console.error("Error saving files:", error);
//     res.status(500).send("Server error.");
//   }
// }

async function uploadCharacterFile(req, res) {
  try {
    const { uid } = req.body;
    if (!uid) {
      return res
        .status(400)
        .json({ message: "Missing required fields in request body." });
    }
    const file = req.file;
    console.log(file);
    const savedFile = await CharacterFile.create({
      userId: uid,
      fieldName: file.fieldname,
      originalName: file.originalname,
      enCoding: file.encoding,
      mimeType: file.mimetype,
      destination: file.destination,
      fileName: file.filename,
      path: file.path,
      size: file.size,
    });
    res.json(savedFile);
  } catch (error) {
    console.error("Error saving files:", error);
    res.status(500).send("Server error.");
  }
}

// async function createUserInfo(req, res) {
//   console.log('~~~~~~~~~~~~~~~~~~~')
//   try {
//     const {
//       email,
//       creationTime,
//       lastSignInTime,
//       uid,
//       providerId,
//       localId,
//       accessToken,
//       refreshToken,
//     } = req.body;
//     if (!email || !creationTime || !lastSignInTime || !uid || !accessToken) {
//       return res
//         .status(400)
//         .json({ message: "Missing required fields in request body." });
//     }
//     const newUser = await UserInfo.create({
//       email,
//       creationTime,
//       lastSignInTime,
//       uid,
//       providerId,
//       localId,
//       accessToken,
//       refreshToken,
//     });
//     res
//       .status(201)
//       .json({ message: "User created successfully", user: newUser });
//   } catch (error) {
//     console.error("Error creating user info:", error);
//     res.status(500).send("Server error.");
//   }
// }


app.post("/api/pwniq/userInfo", async (req, res) => {
  try {
    const {
      email,
      creationTime,
      lastSignInTime,
      uid,
      providerId,
      accessToken,
      refreshToken,
    } = req.body;
    console.log("VVVVVVVVVVVV", req.body);
    if (!email || !creationTime || !lastSignInTime || !uid || !accessToken) {
      return res
        .status(400)
        .json({ message: "Missing required fields in request body." });
    }
    const newUser = await UserInfo.create({
      email,
      creationTime,
      lastSignInTime,
      uid,
      providerId,
      accessToken,
      refreshToken,
    });
    res
      .status(201)
      .json({ message: "User created successfully", user: newUser });
  } catch (error) {
    console.error("Error saving files:", error);
    res.status(500).send("Server error.");
  }
});


// Start the server
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
