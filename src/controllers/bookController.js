const bookModel = require("../models/bookModel");
const reviewModel = require("../models/reviewModel");
const mongoose = require("mongoose");

const isValid = function (value) {
  if (typeof value === "undefined" || value === null) return false;
  if (typeof value === "string" && value.trim().length === 0) return false;
  return true;
};
const isValidObjectId = function(objectId) {
  return mongoose.Types.ObjectId.isValid(objectId);
};

const createBook = async function (req, res) {
  try {
    const getBodyData = req.body;
    const {
      title,
      excerpt,
      userId,
      ISBN,
      category,
      subcategory,
      releasedAt,
    } = getBodyData;

    if (Object.keys(getBodyData).length == 0) {
      return res
        .status(400)
        .send({ status: false, message: "Please Enter Data" });
    }

    if (!isValid(title)) {
      return res
        .status(400)
        .send({ status: false, message: "Please Enter Title" });
    }

    const checkTitle = await bookModel.findOne({ title: title });
    if (checkTitle)
      return res
        .status(400)
        .send({ status: false, message: "Please enter unique title" });

    if (!isValid(excerpt)) {
      return res
        .status(400)
        .send({ status: false, message: "Please Enter excerpt" });
    }

    
    if (!isValidObjectId(userId)) {
      return res.status(400).send({ status: false, message: "Invalid userId" });
    }

    if (!isValid(ISBN)) {
      return res
      .status(400)
      .send({ status: false, message: "Please Enter ISBN" });
    }
    if(!/^(?=(?:\D*\d){10}(?:(?:\D*\d){3})?$)[\d-]+$/.test(ISBN)){return res.status(400).send({ status: false, message:"Please Enter valid ISBN number"})}

    //ISBN uplicate or not
    const checkISBN = await bookModel.findOne({ ISBN: ISBN });
    if (checkISBN)
      return res
        .status(400)
        .send({ status: false, message: "Please Enter unique isbn" });

    //if category is not specified
    if (!isValid(category)) {
      return res
        .status(400)
        .send({ status: false, message: "Please Enter category" });
    }

    if (!isValid(subcategory)) {
      return res
        .status(400)
        .send({ status: false, message: "Please Enter subcategory" });
    }

    //can we skip this portion
    // if (req.body.hasOwnProperty("isDeleted")) {
    //   if (req.body.isDeleted == true) {
    //     req.body.deletedAt = Date.now();
    //   }
    // }

    if(!isValid(releasedAt)){return res.status(400).send({status:false, message:"Please Enter a released date"})}
   
    if (!releasedAt.match(/^\d{4}-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])$/))
      return res.status(400).send({
        status: false,
        message: "Released date format should be in 'yyyy-mm-dd' format",
      });

    const createBook = await bookModel.create(req.body);
    return res
      .status(200)
      .send({ status: true, message: "Success", data: createBook });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

//getBook by query

const getBooks = async function (req, res) {
  try {
    let getQueryData = req.query;
    console.log(getQueryData)
    
    const { userId, category, subcategory } = getQueryData;
    
    if (!userId && !category && !subcategory ) {
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid query data" });
    }

    //value which will show in response
    valueToShow = {
      _id: 1,
      title: 1,
      excerpt: 1,
      userId: 1,
      category: 1,
      releasedAt: 1,
      reviews: 1,
    };
    
    const findBooks = await bookModel
      .find({ $and: [getQueryData, { isDeleted: false }] })
      .select(valueToShow)
      .sort({ title: 1 });
    
    if (!findBooks) { return res.status(404).send({ status: false, message: "No Book found" }); }
    return res
      .status(200)
      .send({ status: true, message: "success", data: findBooks });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

//getBooksDataById

const getBooksDataById = async function (req, res) {
  try {
    let getbookId = req.params.bookId;
    //console.log(getbookId);
    if(!isValidObjectId(getBookId)){res.status(400).send({status: false,message:"BookId is in invalid format."})}
    //try to find book from that id
    let findBooks = await bookModel
      .findOne({ _id: getbookId, isDeleted: false })
      .lean();
    
    //if doc not found
    if (!findBooks) {
      return res.status(404).send({ status: false, message: "Book not found" });
    }

    //Data from reviewModel 
    const findReviews = await reviewModel.find({ bookId: getbookId });
    console.log(findReviews)
    findBooks.reviewsData = findReviews;

    return res
      .status(200)
      .send({ status: true, message: "success", data: findBooks });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

//updateBook
const updateBook = async function (req, res) {
  try {
    getBookId = req.params;
    getBody = req.body;

    //if(!isValidObjectId(getBookId)) {return res.status(400).send({ status:false, message:"Invalid Obejct Id"})}
    if(Object.keys(getBody).length == 0){ return res.status(400).send({ status: false, message: "Please enter body to update" }); }
    const { title, excerpt, releasedDate, ISBN } = getBody;

    if (!title && !excerpt && !releasedDate && !ISBN) {
      return res
        .status(400)
        .send({ status: false, message: "Please enter valid body data" });
    }
     
    let checkDuplicateValue = await bookModel.find(getBody);
    //!I do here genralize meesege so ,is it ok or not
    //?specify things
    if (checkDuplicateValue.length != 0) {
      return res
        .status(409)
        .send({ status: false, message: "you can not update duplicate value" });
    }

    let findBookDoc = await bookModel.findOne({ isDeleted: false, getBookId });
    if (!findBookDoc) {
      return res
        .status(404)
        .send({ status: false, message: "No book available for this id" });
    }
    
    let updateData = await bookModel.findOneAndUpdate(getBookId, getBody);
    return res
      .status(200)
      .send({ status: true, message: "Success", data: updateData });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

//delete api
const deleteBook = async function (req, res) {
  try {
    let bookId = req.params.bookId;

    let book = await bookModel.findOne({ _id: bookId, isDeleted: false });
    if (!book) {
      return res
        .status(404)
        .send({ status: false, message: "book does not exist" });
    }
    await bookModel.findOneAndUpdate(
      { _id: bookId },
      { $set: { isDeleted: true, deletedAt: new Date() } }
    );
    {
      return res
        .status(200)
        .send({ status: true, message: "Book deleted successfully" });
    }
  } catch (error) {
    return res.status(500).send({ status: false, message: error.message });
  }
};

module.exports = {
  createBook,
  updateBook,
  deleteBook,
  getBooks,
  getBooksDataById,
};
