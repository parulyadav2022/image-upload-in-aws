const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');


const authentication = async function (req, res, next) {


    try {
        
        const token = req.headers["x-api-key"];
       
        if (!token) { return res.status(403).send({ status: false, msg: "Missing authentication token in request" }) };

        const decodedToken = await jwt.verify(token, 'Project3')
        if (!decodedToken) { return res.status(403).send({ status: false, message: "Invalid token in request" }) }
        next();
    } catch (error) {
        res.status(500).send({ status: false, message: error.message })

    }
}
const authorization = async function (req, res, next) {
    try {
        let { userId } = req.body
        
        if (!userId) { return res.status(400).send({ status: false, message: "userId required" }) }

        const token = req.headers["x-api-key"]
        const decodedToken = await jwt.verify(token, "Project3")
        console.log(decodedToken)
        if (decodedToken.userId != userId) { return res.status(401).send({ status: false, message: "Unauthorized access" }) }
      // req.userId =decodedToken.userId
        next();
    } catch (error) { req.status(500).send({ status: false, error: error.message }) }
}

module.exports = { authentication, authorization }