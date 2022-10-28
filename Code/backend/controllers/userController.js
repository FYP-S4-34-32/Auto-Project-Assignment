// import mongoose schema - to interact with User's collections
const User = require('../models/userModel')

const mongoose = require('mongoose')

// json web token
const jwt = require('jsonwebtoken')

// to generate json web tokens
const createToken = (_id) => {
    return jwt.sign({_id}, process.env.SECRET, { expiresIn: '1d'}) // token expires in 1 days
}

// login
const loginUser = async (req, res) => {
    const {email, password} = req.body

    try {
        const user = await User.login(email, password)

        // create a token
        const token = createToken(user._id)

        res.status(200).json({email, token})
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}


// signup
const signupUser = async (req, res) => {
    const {email, password} = req.body

    try {
        const user = await User.signup(email, password)

        // create a token
        const token = createToken(user._id)

        res.status(200).json({email, token})
    } catch (error) {
        res.status(400).json({error: error.message})
    }
}

// getUserInfo - TESTING
const getUserInfo = async (req, res) => {
    const { email } = req.params
    console.log(email)

    // grab user object
    const user = await User.find({ email }).sort({ createdAt: -1 }); // descending order

    res.status(200).json(user);
}


// exports
module.exports = {
    loginUser,
    signupUser,
    getUserInfo
}