const express = require('express');

const router = express.Router();
const userController = require('../controllers/userController')
const bookController = require('../controllers/bookController')
const reviewController = require('../controllers/reviewController')
const {authorization,authentication} = require('../middleware/auth')

//user api
router.post('/register',userController.registerUser)
router.post('/login',userController.loginUser)

//books api
 router.post('/books',authentication,authorization,bookController.createBook)
 router.get('/books',bookController.getBooks)
 router.get('/books/:bookId',bookController.getBooksDataById)
 router.put('/books/:bookId',authentication,authorization,bookController.updateBook)
 router.delete('/books/:bookId',authentication,authorization,bookController.deleteBook)

 
//Review Api
router.post('/books/:bookId/review',reviewController.addReview)
router.put('/books/:bookId/review/:reviewId',reviewController.updateReview)
router.delete('/books/:bookId/review/:reviewId',reviewController.deleteReview)



module.exports = router