const express = require("express");
const { upLoad, downLoad } = require("../controllers/loadControllers");

const router = express.Router();

// setup routes and controller functions
router.post("/upload", upLoad);
router.post("/download", downLoad);

module.exports = router;
