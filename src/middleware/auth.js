const jwt = require('jwtwebtoken');
const userModel = require('../models/userModel');


const authentication = async function authUser(req, res, next){
    
    
    try {
        let token = req.headers["X-api-key"]
        const dekodedToken = await jwt.verify(token,'Project3')
        next()

    } catch (error) {
        res.status(500).send({status : false, message : error.message})
        
    }
    


}