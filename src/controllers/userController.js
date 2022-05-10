const userModel = require("../models/userModel");
const jwt = require("jsonwebtoken");

//register api
const registerUser = async function (req, res) {
  try {
    const getBodyData = req.body;
    const { title, name, phone, email, password, address } = getBodyData;

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

    
    if (!["Mr", "Miss", "Mrs"].includes(title)) {
      return res.status(400).send({
        status: false,
        message: "Please Enter valid title from 'Mr','Miss','Mrs'",
      });
    }

    if (!name) {
      return res
        .status(400)
        .send({ status: false, message: "Please Enter name" });
    }

    if (!phone) {
      return res
        .status(400)
        .send({ status: false, message: "Please Enter mobile" });
    }

    const checkPhone = await userModel.findOne({ phone: phone });
    if (checkPhone) {
      return res
        .status(409)
        .send({ status: false, message: "Mobile number is already registred" });
    }

    if (!(/^\d{10}$/).test(phone)) {
      return res
        .status(400)
        .send({ status: false, message: "Mobile no should be valid" });
    }
    //Email Validation
    if (!email) {
      return res
        .status(400)
        .send({ status: false, message: "Please Enter email" });
    }

    const checkEmail = await userModel.findOne({ email: email });

    if (checkEmail) {
      return res
        .status(409)
        .send({ status: false, message: "Email is already register" });
    }

    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      return res
        .status(400)
        .send({ status: false, message: "Email should be valid" });
    }

    if (!password) {
      return res
        .status(400)
        .send({ status: false, message: "Please Enter password" });
    }
    if (password.length <= 8 || password.length >= 15) {
      return res
        .status(400)
        .send({
          status: false,
          message: "password length should be in the range of 8 to 15 only",
        });
    }
    
   if (!address) {
      return res.status(400).send({ status: false, message: "Please Enter address" });
    } 

    if (!address.street) {
      return res.status(400).send({ status: false, message: "Please Enter street" });
    }
    
    if (!address.city) {
      return res.status(400).send({ status: false, message: "Please Enter city" });
    }
    
    if (!address.pincode) {
      return res.status(400).send({ status: false, message: "Please Enter pincode" });
    }

    if (!(/^\d{6}$/).test(address.pincode))  {
        return res.status(400).send({ status: false, message: "only number is accepted in pincode " });
    }
    


    const createUser = await userModel.create(getBodyData);
    return res
      .status(200)
      .send({ status: true, message: "Success", data: createUser });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};

const loginUser = async function (req, res) {
  try {
    const getBodyData = req.body;
    const { email, password } = getBodyData;

    if (!email) {
        return res
          .status(400)
          .send({ status: false, message: "Please Enter Email" });
      }
    if (!password) {
        return res
          .status(400)
          .send({ status: false, message: "Please Enter password" });
      }
    
    const findUser = await userModel.findOne({
      email: email,
      password: password,
    });
    if (!findUser) {
      return res
        .status(400)
        .send({ status: false, message: "Incorrect Email or password" });
    }

    const token = jwt.sign(
      {
        userid: findUser._id.toString(),
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 10 * 60 * 60,
      },
      "Project3"
    );
    res.header("x-api-key", token);

    return res
      .status(200)
      .send({ status: true, message: "Login successfull", data: token });
  } catch (error) {
    res.status(500).send({ status: false, message: error.message });
  }
};
module.exports = { registerUser, loginUser };
