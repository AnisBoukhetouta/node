const express = require("express")
const {loginAuth, signupAuth} = require("../controllers/authControllers")

const router = express.Router()

// setup routes and controller functions
router.post('/login', loginAuth)
router.post('/signup', signupAuth)

module.exports = router