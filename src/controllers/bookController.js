const userModel = require("../models/bookModel");

const createBook = async function(req,res)
{
try {
    const getBodyData = req.body;
    const { title, excerpt, userId, ISBN, category, subcategory, reviews,releasedAt } = getBodyData;

    if (Object.keys(getBodyData).length == 0) {
      return res
        .status(400)
        .send({ status: false, message: "Please Enter Data" });
    }

    if (!title) {
      return res
        .status(400)
        .send({ status: false, message: "Please Enter Title" });
    }

    const checkTitle = await bookModel.findOne({ title: title });
    if(!checkTitle) return res.status(400).send({ status: false, message: "Please enter unique title" })

    if (!excerpt) {
      return res
        .status(400)
        .send({ status: false, message: "Please Enter excerpt" });
    }

    if (!userId) {
      return res
        .status(400)
        .send({ status: false, message: "Please Enter userId" });
    }
    const checkUserId = await bookModel.findOne({ userId:userId });
    if(!checkUserId)  return res
    .status(400)
    .send({ status: false, message: "Please Enter valid userId" });

    if (!ISBN) {
        return res
          .status(400)
          .send({ status: false, message: "Please Enter ISBN" });
      }


    const checkISBN = await bookModel.findOne({ ISBN:ISBN });
    if(!checkISBN)  return res
    .status(400)
    .send({ status: false, message: "Please Enter unique isbn" });
  
      if (!category) {
        return res
          .status(400)
          .send({ status: false, message: "Please Enter category" });
      }

      if (!subcategory) {
        return res
          .status(400)
          .send({ status: false, message: "Please Enter subcategory" });
      }

      if (!reviews) {
        return res
          .status(400)
          .send({ status: false, message: "Please Enter reviews" });
      }


      if(req.body.hasOwnProperty('isDeleted'))
      {
          if(req.body.isDeleted == true)
          {
              req.body.deletedAt = Date.now()
          }
      }

      if (!releasedAt.match(/^\d{4}-\d{2}-\d{2}$/)) return res.status(400).send({ status:false , message:"released date format is not correct" })


    const createBook = await bookModel.create(req.body);
    return res
      .status(200)
      .send({ status: true, message: "Success", data: createBook });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
}

module.exports.createBook = createBook