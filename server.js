// importing required packages
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes")

// init express node app
const app = express();

// allow the app to use middleware
app.use(cors())
app.use(express.json())
app.use((req, res, next) => {
    console.log(req.path, req.method)
    next()
})
app.use("/", authRoutes)

// connect the app to a database
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    app.listen(process.env.PORT, () => {
        console.log("connected to db and server started on", process.env.PORT);
    });
})
.catch((error) => {
    console.log(error)
})