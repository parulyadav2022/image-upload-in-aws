const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');
const bookModel = require('../models/bookModel');
const mongoose = require('mongoose')

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

        //let { userId } = req.body
        const isValidObjectId = function(objectId) {
            return mongoose.Types.ObjectId.isValid(objectId);
          };
          
        //if (!userId) { return res.status(400).send({ status: false, message: "userId required" }) }

        const token = req.headers["x-api-key"]
        const decodedToken = await jwt.verify(token, "Project3")
        let isUserId;
        
        if(req.body.hasOwnProperty("userId")){
            if(!isValidObjectId(req.body.userId)) {return res.status(400).send({ status:false, message:"Invalid Obejct Id"})}
            isUserId = req.body.userId
        }

        if(req.params.hasOwnProperty("bookId")){
            if(!isValidObjectId(req.params.bookId)) {return res.status(400).send({ status:false, message:"Invalid Obejct Id"})}
            let getUserId = await bookModel.findById(req.params.bookId)
            if(!getUserId) {return res.status(400).send({ status:false, message:"Books not found"})}
            isUserId = getUserId.userId.toString()
        }
    
        if(!isUserId) {return res.status(400).send({status:false, message:"UserId is required"})}

        if (decodedToken.userId != isUserId) { return res.status(401).send({ status: false, message: "Unauthorized access" }) }
      // req.userId =decodedToken.userId
      console.log(isUserId)
        next();
    } catch (error) { res.status(500).send({ status: false, error: error.message }) }
}

module.exports = { authentication, authorization }