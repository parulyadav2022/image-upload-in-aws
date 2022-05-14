const reviewModel = require('../models/reviewModel')
const bookModel = require('../models/bookModel')
const mongoose = require('mongoose')

const isValid = function (value) {
	if (typeof value === 'undefined' || value === null) return false
	if (typeof value === 'string' && value.trim().length === 0) return false
	return true
}


const isValidObjectId = function (objectId) {
	return mongoose.Types.ObjectId.isValid(objectId)
}

//POST /books/:bookId/review
const addReview = async function (req, res) {
	try {
		const { bookId } = req.params
		const getBodyData = req.body
		req.body.bookId = bookId

		if (Object.keys(getBodyData).length == 0) {
			return res
				.status(400)
				.send({ status: false, message: 'Please Enter data to create review' })
		}
		//validation
		if (!isValidObjectId(bookId)) {
			return res
				.status(403)
				.send({ status: false }, { message: 'Invalid bookId' })
		}

		const isBookAvalilable = await bookModel
			.findOne({ _id: bookId, isDeleted: false })
			.lean()
		if (!isBookAvalilable) {
			return res.status(404).send({ message: 'Book is not available' })
		}

		const { rating } = getBodyData
		if (!isValid(rating)) {
			return res.status(400).send({ message: 'please enter rating first' })
		}

		//if user enters any any non integer value
		if (!Number.isInteger(rating)) {
			return res
				.status(400)
				.send({ status: false, message: 'rating should be in number' })
		}

		// validation for rating
		if (rating < 1 || rating > 5) {
			return res
				.status(400)
				.send({ status: false, message: 'rating must be in the range of 1-5' })
		} 

		//if passing validation

		//reviewedAt key added
		getBodyData.reviewedAt = Date.now()

		//create entry in review model
		let reviewedData = await reviewModel.create(getBodyData)

		//to increment review in bookmodel after adding review
		await bookModel.updateOne({ _id: bookId }, { $inc: { reviews: 1 } })

		return res.status(200).send({
			status: true,
			message: 'Successfully added review',
			data: reviewedData,
		})
	} catch (error) {
		return res.status(500).send({ status: false, message: error.message })
	}
}

const updateReview = async function (req, res) {
	try {
		const getBodyData = req.body
		const getBookId = req.params.bookId
		const getReviewId = req.params.reviewId


		if(!isValidObjectId(getBookId)){return res.status(400).send({ status: false, message: 'please enter Valid bookId' })}
		if(!isValidObjectId(getReviewId)){return res.status(400).send({ status: false, message: 'please enter Valid reviewId' })}
		
		const findBookDoc = await bookModel
			.findOne({ _id: getBookId, isDeleted: false })
			.lean()

		if (!findBookDoc) {
			return res
				.status(404)
				.send({ status: false, message: 'Book does not exists ' })
		}

		const findReviewDoc = await reviewModel.findOne({ _id: getReviewId, isDeleted: false })
		if (!findReviewDoc) {return res.status(404).send({ status: false, message: 'Review does not exsits'})}


		if (Object.keys(getBodyData).length == 0) {
			return res
				.status(400)
				.send({ status: false, message: 'Please Enter Data' })
		}

		//validation
		const { review, rating, reviewedBy } = getBodyData
		if(rating){
		if (!Number.isInteger(rating)) {
			return res
				.status(400)
				.send({ status: false, message: 'rating should be in number' })
		}

		if (rating < 1 || rating > 5) {
			return res
				.status(400)
				.send({ status: false, message: 'rating must be in the range of 1-5' })
		}}
		

		
		
		const updatedReview = await reviewModel.findOneAndUpdate(
			{ _id: getReviewId, isDeleted: false },
			{ $set: { review: review, rating: rating, reviewedBy: reviewedBy } },
			{ new: true }
		)

		return res
			.status(200)
			.send({ status: true, message: 'success', data: updatedReview })
	} catch (err) {
		return res.status(500).send({ status: false, error: err.message })
	}
}

const deleteReview = async function (req, res) {
	try {
		let bookId = req.params.bookId
		let reviewId = req.params.reviewId

		if(!isValidObjectId(bookId)){return res.status(400).send({ status: false, message: 'please enter Valid bookId' })}
		if(!isValidObjectId(reviewId)){return res.status(400).send({ status: false, message: 'please enter Valid reviewId' })}
		

		let isReviewExists = await reviewModel.findOne({
			_id: reviewId,		
			bookId: bookId, //to check if review belongs to book
			isDeleted: false,
		})

		if (!isReviewExists) {
			return res
				.status(404)
				.send({ status: false, message: 'Review does not exist' })
		}

		await reviewModel.findOneAndUpdate(
			{ _id: reviewId },
			{ $set: { isDeleted: true, deletedAt: new Date() } }
		)

		await bookModel.findOneAndUpdate({ _id: bookId }, { $inc: { reviews: -1 } })

		
			return res
				.status(200)
				.send({ status: true, message: 'review deleted successfully' })
		
	} catch (error) {
		return res.status(500).send({ status: false, message: error.message })
	}
}

module.exports = { addReview, deleteReview, updateReview }
