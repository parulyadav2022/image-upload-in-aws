const express = require('express');
const aws =require("aws-sdk")
const router = express.Router();
const multer= require("multer");
const userController = require('../controllers/userController')
const bookController = require('../controllers/bookController')
const reviewController = require('../controllers/reviewController')
const {authorization,authentication} = require('../middleware/auth')

/*router.get("/test-me",function(req,res)
{
    res.send("My first ever api")
})*/



let uploadFile= async ( file) =>{
    return new Promise( function(resolve, reject) {
     // this function will upload file to aws and return the link
     let s3= new aws.S3({apiVersion: '2006-03-01'}); // we will be using the s3 service of aws
 
     var uploadParams= {
         ACL: "public-read",
         Bucket: "classroom-training-bucket",  //HERE
         Key: "abc/" + file.pic, //HERE 
         Body: file.buffer
     }

     s3.upload( uploadParams, function (err, data ){
        if(err) {
            return reject({"error": err})
        }
        console.log(data)
        console.log("file uploaded succesfully")
        return resolve(data.Location)
    })

    // let data= await s3.upload( uploadParams)
    // if( data) return data.Location
    // else return "there is an error"

   })
}

router.post("/write-file-aws", async function(req, res){

    try{
        let files= req.file
        if(files && files.length>0){
            //upload to s3 and get the uploaded link
            // res.send the link back to frontend/postman
            let uploadedFileURL= await uploadFile( files[0] )
            res.status(201).send({msg: "file uploaded succesfully", data: uploadedFileURL})
        }
        else{
            res.status(400).send({ msg: "No file found" })
        }
        
    }
    catch(err){
        res.status(500).send({msg: err})
    }
    
})


//user api
router.post('/register',userController.registerUser)
router.post('/login',userController.loginUser)

//books api
 router.post('/books',bookController.createBook)
 router.get('/books',bookController.getBooks)
 router.get('/books/:bookId',bookController.getBooksDataById)
 router.put('/books/:bookId',authentication,authorization,bookController.updateBook)
 router.delete('/books/:bookId',authentication,authorization,bookController.deleteBook)

 
//Review Api
router.post('/books/:bookId/review',reviewController.addReview)
router.put('/books/:bookId/review/:reviewId',reviewController.updateReview)
router.delete('/books/:bookId/review/:reviewId',reviewController.deleteReview)



module.exports = router