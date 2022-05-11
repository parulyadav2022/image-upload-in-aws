const reviewModel = require('../models/reviewModel');
const bookModel = require('../models/bookModel');
const mongoose = require('mongoose');

const isValid = function(value){
    if(typeof value === 'undefined' || value === null )return false;
    if(typeof value === 'string' && value.trim().length === 0)return false;
    return true;
}


const isvalidObjectId = function(objectId) {
    return mongoose.Types.ObjectId.isValid(objectId);
}

//POST /books/:bookId/review
const addReview = async function(req,res){
      const {bookId} = req.params
      const  getBodyData = req.body
        
      //validation
      if(isvalidObjectId(bookId)){return res.status(403).render('error',{message:'Invalid bookId'})}

      //logic

      const review = await reviewModel.create()

    
}
module.exports = {addReview};