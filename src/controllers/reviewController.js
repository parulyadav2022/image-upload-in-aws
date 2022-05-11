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
    try{
      const {bookId} = req.params
      const  getBodyData = req.body
      req.body.bookId = bookId
//validation
//if(isvalidObjectId(bookId)){return res.status(403).send({status: false},{message:'Invalid bookId'})}
 const isBookAvalilable  = await bookModel.findOne({_id:bookId,isDeleted: false}).lean()
 if(!isBookAvalilable){return res.status(404).send({message:'Book is not available'})}
 

      const {reviewedBy,rating} = getBodyData
      if(!Number.isInteger(rating)){return res.status(400).send({status: false,message : "rating should be in number"})}
      if(rating<1 && rating>5){return res.status(400).send({status: false,message:"rating must be in the range of 1-5"})}
      getBodyData.reviewedAt = Date.now() 


      const createReview = await reviewModel.create(getBodyData)

      const Updatedbooks =await bookModel.findOneAndUpdate({_id:bookId},{$inc : {reviews : 1}},{new:true}).lean()
    
     Updatedbooks.reviewsData =createReview 
     
    return res.status(200).send({status: true,message : "Successfully added review",data:Updatedbooks})

    }catch(error){
        return res.status(500).send({status: false,message : error.message})
    }   
}
module.exports = {addReview};