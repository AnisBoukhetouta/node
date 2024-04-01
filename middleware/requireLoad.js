const jwt = require("jsonwebtoken")
const Auth = require("../models/authModel")

const requireLoad = async (req, res, next) => {
    const { authorization } = req.headers
    if(!authorization){
        return res.status(401).json({error: "Authorisation token required"})
    }
    const token = authorization.split(' ')[1]
    try{
        const {_id} = jwt.verify(token, process.env.SECRET)
        req.auth = await Auth.findOne({_id}).select("_id")
        next()
    }
    catch (error) {
        console.log(error)
        res.status(401).json({error: "Request is not authorised"})
    }
}

module.exports = requireLoad

// use in another route file. ie when auth wants to access grants
// const requireLoad = require("path")
// router.use(requireLoad)