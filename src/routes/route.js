const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController')

//user api
router.post('/register',userController.registerUser)
router.post('/login',userController.loginUser)
router.post('/book' , bookController.createBook)
//books api
// router.post('/books',)
// router.get('/books',)
// router.get('/books/:bookId',)
// router.put('/books/:bookId',)
// router.delete('/books/:bookId',)

//Review Api
// router.post('/books/:bookId/review',)
// router.put('/books/:bookId/review/:reviewId',)
// router.delete('/books/:bookId/review/:reviewId',)



module.exports = router 