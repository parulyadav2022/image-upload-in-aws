const express = require('express');

const router = express.Router();
const userController = require('../controllers/userController')
const bookController = require('../controllers/bookController')
//user api
router.post('/register',userController.registerUser)
router.post('/login',userController.loginUser)


//books api

 router.post('/book' , bookController.createBook)
 router.get('/books',bookController.getBooks)
 router.get('/books/:bookId',bookController.getBooksDataById)
 router.put('/books/:bookId',bookController.updateBook)
 router.delete('/books/:bookId',bookController.deleteBook)

//Review Api
// router.post('/books/:bookId/review',)
// router.put('/books/:bookId/review/:reviewId',)
// router.delete('/books/:bookId/review/:reviewId',)



module.exports = router 