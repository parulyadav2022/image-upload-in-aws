const reviewModel = require("../models/reviewModel");
const bookModel = require("../models/bookModel");
const mongoose = require("mongoose");

const isValid = function (value) {
  if (typeof value === "undefined" || value === null) return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  return true;
};

const isvalidObjectId = function (objectId) {
  return mongoose.Types.ObjectId.isValid(objectId);
};

//POST /books/:bookId/review
const addReview = async function (req, res) {
  try {
    const { bookId } = req.params;
    const getBodyData = req.body;
    req.body.bookId = bookId;


    //validation
    if(!isvalidObjectId(bookId)){return res.status(403).send({status: false},{message:'Invalid bookId'})}
    const isBookAvalilable = await bookModel
      .findOne({ _id: bookId, isDeleted: false })
      .lean();
    if (!isBookAvalilable) {
      return res.status(404).send({ message: "Book is not available" });
    }

    const { rating } = getBodyData;
    if(!isValid(rating)){return res.status(400).send({ message:"please enter rating first"})}

    //if user enters any any non integer value
    if (!Number.isInteger(rating)) {
      return res
        .status(400)
        .send({ status: false, message: "rating should be in number" });
    }

    //wrong validation
    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .send({ status: false, message: "rating must be in the range of 1-5" });
    }

    //if passing validation

    //reviewdAt key added
    getBodyData.reviewedAt = Date.now();

    //create entry in review model
    await reviewModel.create(getBodyData);

    //to increment reiew in bookmodel after adding review
    const Updatedbooks = await bookModel
      .findOneAndUpdate(
        { _id: bookId },
        { $inc: { reviews: 1 } },
        { new: true }
      )
      .lean();

      //!new changes added to get data review data in array
    const getReviewsData = await reviewModel.find({bookId:bookId})
    console.log(getReviewsData);
    //added createreview data into reviewsData key
    Updatedbooks.reviewsData = getReviewsData;

    return res.status(200).send({
      status: true,
      message: "Successfully added review",
      data: Updatedbooks,
    });
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

const deleteReview = async function (req, res) {
  try {
    let bookId = req.params.bookId;
    let reviewId = req.params.reviewId;

    let isReviewExists = await reviewModel.findOne({ _id: reviewId, isDeleted: false });
    if (!isReviewExists) {
      return res
        .status(404)
        .send({ status: false, message: "Review does not exist" });
    }

    await reviewModel.findOneAndUpdate(
      { _id: reviewId },
      { $set: { isDeleted: true, deletedAt: new Date() } }
    );

    await bookModel.findOneAndUpdate({_id:bookId},{$inc: {reviews: -1}})



    {
      return res
        .status(200)
        .send({ status: true, message: "review deleted successfully" });
    }
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = { addReview,deleteReview };
