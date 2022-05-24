//@ts-check
const bookModel = require('../models/bookModel')
const reviewModel = require('../models/reviewModel')
const mongoose = require('mongoose')
const aws= require("aws-sdk")


const isValid = function (value) {
	if (typeof value === 'undefined' || value === null) return false
	if (typeof value === 'string' && value.trim().length === 0) return false
	return true
}
const isValidObjectId = function (objectId) {
	return mongoose.Types.ObjectId.isValid(objectId)
}

aws.config.update({
    accessKeyId: "AKIAY3L35MCRUJ6WPO6J",
    secretAccessKey: "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",
    region: "ap-south-1"
})

let uploadFile= async ( file) =>{
	return new Promise( function(resolve, reject) {
	 // this function will upload file to aws and return the link
	 let s3= new aws.S3({apiVersion: '2006-03-01'}); // we will be using the s3 service of aws
 
	 var uploadParams= {
		 ACL: "public-read",
		 Bucket: "classroom-training-bucket",  //HERE
		 Key: "abc/" + file.originalname, //HERE 
		 Body: file.buffer
	 }
 
 
	 s3.upload( uploadParams, function (err, data ){
		 console.log(3)
		 if(err) {
			 return reject({"error": err})
		 }
		 console.log(data)
		 console.log("file uploaded succesfully")
		 return resolve(data.Location)
	 })
	 console.log(1)
 
	 // let data= await s3.upload( uploadParams)
	 // if( data) return data.Location
	 // else return "there is an error"
 
	})
 }




const createBook = async function (req, res) {
	try {
		let getBodyData = req.body;
        console.log(getBodyData)
       
		

		/*if (Object.keys(getBodyData).length == 0) {
			return res
				.status(400)
				.send({ status: false, message: 'Please Enter Data' })
		}*/

		const { title, excerpt, userId, ISBN, bookCover, category, subcategory, releasedAt } =
			getBodyData

		if (!isValid(title)) {
			return res
				.status(400)
				.send({ status: false, message: 'Please Enter Title' })
		}

		const checkTitle = await bookModel.findOne({ title: title })
		if (checkTitle)
			return res
				.status(400)
				.send({ status: false, message: 'Please enter unique title' })

		if (!isValid(excerpt)) {
			return res
				.status(400)
				.send({ status: false, message: 'Please Enter excerpt' })
		}

		//if userId is not valid
		if(!isValid(userId)) {return res.status(400).send({ status: false, message: 'Please Enter userId' })}
		if (!isValidObjectId(userId)) {
			return res.status(400).send({ status: false, message: 'Invalid userId' })
		}

		if (!isValid(ISBN)) {
			return res
				.status(400)
				.send({ status: false, message: 'Please Enter ISBN' })
		}
		if (!/^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/.test(ISBN.trim())) {
			return res
				.status(400)
				.send({ status: false, message: 'Please Enter valid ISBN number' })
		}

		//ISBN duplicate or not
		const checkISBN = await bookModel.findOne({ ISBN: ISBN })
		if (checkISBN)
			return res
				.status(400)
				.send({ status: false, message: 'Please Enter unique ISBN' })

		//if category is not specified
		if (!isValid(category)) {
			return res
				.status(400)
				.send({ status: false, message: 'Please Enter category' })
		}

		if (!isValid(subcategory)) {
			return res
				.status(400)
				.send({ status: false, message: 'Please Enter subcategory' })
		}

		if (!isValid(releasedAt)) {
			return res
				.status(400)
				.send({ status: false, message: 'Please Enter a released date' })
		}

		if (!releasedAt.trim().match(/^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/))
			return res.status(400).send({
				status: false,
				message: "Released date format should be in 'yyyy-mm-dd' format",
			})


//upload files......................................

			let files= req.files
			if(files && files.length>0){
				//upload to s3 and get the uploaded link
				// res.send the link back to frontend/postman
				let uploadedFileURL= await uploadFile( files[0] )
				getBodyData.bookCover = uploadedFileURL
				console.log(2)
			}
			//else{
				//return res.status(400).send({message:"book cover image not given"})
			//}
//.............................................................


		const addBook = await bookModel.create(req.body)
		return res
			.status(201)
			.send({ status: true, message: 'Success', data: addBook })
	} catch (error) {
		res.status(500).send({ status: false, message: error.message })
	}
}

//getBook by query

const getBooks = async function (req, res) {
	try {
		let getQueryData = req.query
		

		const { userId, category, subcategory } = getQueryData

		if (Object.keys(getQueryData).length > 0) {
			if (!userId && !category && !subcategory) {
				return res.status(400).send({
					status: false,
					message: "Please enter value like  'userId','category','subcategory'",
				})
			}
		}

		//value which will show in response
		let valueToShow = {
			_id: 1,
			title: 1,
			excerpt: 1,
			userId: 1,
			category: 1,
			subcategory: 1,
			releasedAt: 1, 
			reviews: 1,
		}

		const findBooks = await bookModel
			.find({ $and: [getQueryData, { isDeleted: false }] })
			.select(valueToShow)
			.collation({ locale: 'en' })
			.sort({ title: 1 })
		

		if (findBooks.length == 0) {
			return res.status(404).send({ status: false, message: 'No Book found' })
		}
		return res
			.status(200)
			.send({ status: true, message: 'success', data: findBooks })
	} catch (error) {
		res.status(500).send({ status: false, message: error.message })
	}
}

//getBooksDataById

const getBooksDataById = async function (req, res) {
	try {
		let getbookId = req.params.bookId

		if (!isValidObjectId(getbookId)) {
			return res
				.status(400)
				.send({ status: false, message: 'BookId is in invalid format.' })
		}
		//try to find book from that id
		let findBooks = await bookModel
			.findOne({ _id: getbookId, isDeleted: false },{deletedAt:0,__v:0})
			.lean()

		//if doc not found
		if (!findBooks) {
			return res.status(404).send({ status: false, message: 'Book not found' })
		}

		//Data from reviewModel
		let  valueTohide = { isDeleted: 0,createdAt: 0,updatedAt: 0,__v: 0}
		const findReviews = await reviewModel.find({ bookId: getbookId ,isDeleted: false},valueTohide)

		findBooks.reviewsData = findReviews

		return res
			.status(200)
			.send({ status: true, message: 'success', data: findBooks })
	} catch (error) {
		res.status(500).send({ status: false, message: error.message })
	}
}

//updateBook
const updateBook = async function (req, res) {
	try {
		let getBookId = req.params.bookId
		let getBody = req.body

		if (!isValidObjectId(getBookId)) {
			return res
				.status(401)
				.send({ status: false, message: 'Invalid Book Id' })
		}
		if (Object.keys(getBody).length == 0) {
			return res
				.status(400)
				.send({ status: false, message: 'Please enter body to update' })
		}

		const { title, excerpt, releasedDate, ISBN } = getBody

		if (!title && !excerpt && !releasedDate && !ISBN) {
			return res.status(400).send({
				status: false,
				message:
					"You can update only 'title', 'excerpt', 'releasedDate', 'ISBN' only",
			})
		}

		let checkDuplicateValue = await bookModel.findOne({$or: [{ title: title }, { ISBN: ISBN }]})


		if (checkDuplicateValue) {
			return res
				.status(409)
				.send({ status: false, message: 'you can not update duplicate value , TITLE or ISBN' })
		}

		let findBookDoc = await bookModel.findOne({ isDeleted: false, getBookId })
		if (!findBookDoc) {
			return res
				.status(404)
				.send({ status: false, message: 'No book available for this id' })
		}

		let updateData = await bookModel.findByIdAndUpdate(
			{ _id: getBookId },
			getBody,
			{ new: true }
		)
		return res
			.status(200)
			.send({ status: true, message: 'Success', data: updateData })
	} catch (error) {
		res.status(500).send({ status: false, message: error.message })
	}
}

//delete api
const deleteBook = async function (req, res) {
	try {
		let bookId = req.params.bookId

		let book = await bookModel.findOne({ _id: bookId, isDeleted: false })
		if (!book) {
			return res
				.status(404)
				.send({ status: false, message: 'book does not exist' })
		}
		await bookModel.findOneAndUpdate(
			{ _id: bookId },
			{ $set: { isDeleted: true, deletedAt: new Date() } }
		)

		//delete all the reviews which belongs to that book which we want to deleteBook
		await reviewModel.updateMany(
			{ _id: bookId, isDeleted: false },
			{ $set: { isDeleted: true } }
		)

		return res
			.status(200)
			.send({ status: true, message: 'Book deleted successfully' })
	} catch (error) {
		return res.status(500).send({ status: false, message: error.message })
	}
}

module.exports = {
	createBook,
	updateBook,
	deleteBook,
	getBooks,
	getBooksDataById,
}
