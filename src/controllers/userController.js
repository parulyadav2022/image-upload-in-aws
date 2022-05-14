const userModel = require('../models/userModel')
const jwt = require('jsonwebtoken')

// to check wether value is undefined or not provided in the request
const isValid = function (value) {
	if (typeof value === 'undefined' || value === null) return false
	if (typeof value === 'string' && value.trim().length === 0) return false
	return true
}

//register api
const registerUser = async function (req, res) {
	try {
		const getBodyData = req.body
		const { title, name, phone, email, password, address } = getBodyData


		if (Object.keys(getBodyData).length == 0) {
			return res
				.status(400)
				.send({ status: false, message: 'Please Enter Data title, name, phone, email, password, address' })
		}

		if (!isValid(title)) {
			return res
				.status(400)
				.send({ status: false, message: 'Please Enter Title' })
		}

		if (!['Mr', 'Miss', 'Mrs'].includes(title)) {
			return res.status(400).send({
				status: false,
				message: "Please Enter valid title from 'Mr','Miss','Mrs'",
			})
		}

		if (!isValid(name)) {
			return res
				.status(400)
				.send({ status: false, message: 'Please Enter name' })
		}
//we can use has own property also to handle this
		if (!isValid(phone)) {
			return res
				.status(400)
				.send({ status: false, message: 'Please Enter mobile' })
		}

		const checkPhone = await userModel.findOne({ phone: phone })
		if (checkPhone) {
			return res
				.status(409)
				.send({ status: false, message: 'Mobile number is already registred' })
		}

		if (!/^\d{10}$/.test(phone)) {
			return res
				.status(400)
				.send({ status: false, message: 'Mobile no should be valid' })
		}
		//Email Validation
		if (!isValid(email)) {
			return res
				.status(400)
				.send({ status: false, message: 'Please Enter email' })
		}

		const checkEmail = await userModel.findOne({ email: email })

		if (checkEmail) {
			return res
				.status(409)
				.send({ status: false, message: 'Email is already register' })
		}

		if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email.trim())) {
			return res
				.status(400)
				.send({ status: false, message: 'Email should be valid' })
		}


		if (!isValid(password)) {
			return res
				.status(400)
				.send({ status: false, message: 'Please Enter password' })
		}
		if (password.length <= 8 || password.length >= 15) {
			return res.status(400).send({
				status: false,
				message: 'password length should be in the range of 8 to 15 only',
			})
		}

		if (!/^\d{6}$/.test(address.pincode)) {
			return res
				.status(400)
				.send({ status: false, message: 'only number is accepted in pincode ' })
		}

		const createUser = await userModel.create(getBodyData)
		return res
			.status(201)
			.send({ status: true, message: 'Success', data: createUser })
	} catch (error) {
		res.status(500).send({ status: false, message: error.message })
	}
}

const loginUser = async function (req, res) {
	try {
		const getBodyData = req.body
		const { email, password } = getBodyData

		if (Object.keys(getBodyData).length == 0) {
			return res
				.status(400)
				.send({ status: false, message: "Please Enter Data 'email & password" })
		}

		if (!isValid(email)) {
			return res
				.status(400)
				.send({ status: false, message: 'Please Enter Email' })
		}
		if (!isValid(password)) {
			return res
				.status(400)
				.send({ status: false, message: 'Please Enter password' })
		}

		const findUser = await userModel.findOne({
			email: email,
			password: password,
		})
		if (!findUser) {
			return res
				.status(400)
				.send({ status: false, message: 'Incorrect Email or password' })
		}

		const token = jwt.sign(
			{
				userId: findUser._id.toString(),
				iat: Math.floor(Date.now() / 1000),
				exp: Math.floor(Date.now() / 1000) + 10 * 60 * 60,
			},
			'Project3'
		)
		res.header('x-api-key', token)

		return res
			.status(200)
			.send({ status: true, message: 'Login successfull', data: token })
	} catch (error) {
		res.status(500).send({ status: false, message: error.message })
	}
}
module.exports = { registerUser, loginUser }


