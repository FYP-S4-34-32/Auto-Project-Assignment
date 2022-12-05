//==============================================================//
// File which does the heavylifting according to route requests //
//==============================================================//

// imports
const User = require('../models/userModel') // MongoDB model created in userModel.js in the models folder
const mongoose = require('mongoose') // mongoose package for mongodb
const jwt = require('jsonwebtoken') // jsonwebtoken package to help our backend and frontend to communicate with regards to authentication

// to generate json web tokens - takes in the _id property of the user
const createToken = (_id) => {
    // the sign function will take in a SECRET, which is a randomly generated password(by us)
    // to sign the token
    return jwt.sign({_id}, process.env.SECRET, { expiresIn: '1d'}) // token expires in 1 day
}
    
//================================================================================================================//
// LOGIN USER:
// 1. invoke the userSchema.statics.login function from userModel.js inside the models folder
// 2. IF everything is ok(login successful), function will return the user object
// 3. ELSE(login UNSUCCESSFUL) the function will return an error, which will be caught in the catch(error) block
//    and return an error message written in the userSchema.statics.login function
// 4. store the user object returned to us in the variable 'user'
// 5. create a jsonwebtoken which takes in the _id property of the user
// 6. returns the user's email and the token we just generated in json format
//================================================================================================================//
const loginUser = async (req, res) => {
    // the body of the request in our login case will be in the following format:
    // {
    //      "email": "example@email.com",
    // }    "password": "example password"
    // -> so we can destructure the request body and obtain the email and password value

    const {email, password} = req.body

    try {
        // invoke login function and store return value(user document)
        const user = await User.login(email, password)
        
        const role = user.role // user's role
        const name = user.name // user's name 
        const contact = user.contact // user's contact number
        const skills = user.skills // user's skills
        const organisation_id = user.organisation_id // user's organisation id

        // create a jsonwebtoken
        const token = createToken(user._id)

        // return the user's email, role, and the token we just generated in json format
        res.status(200).json({email, token, role, name, contact, skills, organisation_id})
    } catch (error) { // catch any error that pops up during the login process - refer to the login function in userModel.js
        // return the error message in json
        res.status(400).json({error: error.message})
    }
}

//================================================================================================================//
// SIGNUP USER:
// 1. invoke the userSchema.statics.signup function from userModel.js inside the models folder
// 2. IF everything is ok(signup successful), function will return the user object
// 3. ELSE(signup UNSUCCESSFUL) the function will return an error, which will be caught in the catch(error) block
//    and return an error message written in the userSchema.statics.signup function
// 4. store the user object returned to us in the variable 'user'
// 5. create a jsonwebtoken which takes in the _id property of the user
// 6. returns the user's email and the token we just generated in json format
//================================================================================================================//
const signupUser = async (req, res) => {
    // the body of the request in our login case will be in the following format:
    // {
    //      "name": "example choo"
    //      "email": "example@email.com",
    // }    "password": "example password"
    // -> so we can destructure the request body and obtain the name, email and password value

    const {name, email, password, role} = req.body

    try {
        // invoke signup function and store return value(user document)
        const user = await User.signup(name, email, password, role)
        
        // create a jsonwebtoken
        const token = createToken(user._id)

        // return the user's name, email, role and the token we just generated in json format
        res.status(200).json({name, email, token, role})
    } catch (error) { // catch any error that pops up during the login process - refer to the login function in userModel.js
        // return the error message in json
        res.status(400).json({error: error.message})
    }
}

// GET all users info
const getAllUserInfo = async (req, res) => {
    const users = await User.getAllUsers()

    res.status(200).json(users)
}

// GET user info
const getUserInfo = async (req, res) => {
    const { email } = (req.body) // grab email from the request object

    // get the document
    const userInfo = await User.getOneUser(email)
    
    res.status(200).json(userInfo)
}

// UPDATE user info
const updateUserInfo = async (req, res) => {
    const {email, contact} = req.body

    try {
        // invoke updateInfo function in userModel.js
        const user = await User.updateInfo(email, contact)

        // return the request object
        res.status(200).json({ user })
    } catch (error) { // catch any error that pops up during the process
        // return the error message in json
        res.status(400).json({error: error.message})
    }
}

// POST a new skill
const addUserSkill = async (req, res) => {
    const { email, skill, competency } = req.body // req.body -> { "email": email, "skill": skillName, "competency": competencyLevel }
    
    try {
        // invoke addNewSkill function in userModel.js
        const user = await User.addNewSkill(email, skill, competency)

        const skills = user.skills

        // return the email and skills
        res.status(200).json({ email, skills })
    } catch (error) { // catch any error that pops up during the process
        // return the error message in json
        res.status(400).json({error: error.message})
    }

}

// UPDATE skill competency
const updateUserSkill = async (req, res) => {

    const { email, skill, competency } = req.body // req.body -> { "email": email, "skill": skillName, "competency": competencyLevel }

    try {
        // invoke updateSkill function in userModel.js
        const user = await User.updateSkill(email, skill, competency)

        const skills = user.skills

        // return the email and skills
        res.status(200).json({ email, skills })
    } catch (error) { // catch any error that pops up during the process
        // return the error message in json
        res.status(400).json({error: error.message})
    }
}

// DELETE user skill
const deleteUserSkill = async (req, res) => {
    const { email } = req.body

    try {
        // invoke deleteSkill function in userModel.js
        const user = await User.deleteSkill(req)

        const skills = user.skills

        // return the email and skills
        res.status(200).json({ email, skills })
    } catch (error) { // catch any error that pops up during the process
        // return the error message in json
        res.status(400).json({error: error.message})
    }
}

const changeUserPassword = async (req, res) => {
    const { email, currentPassword, newPassword} = req.body

    try {
        // invoke changePassword function in userModel.js
        const user = await User.changePassword(email, currentPassword, newPassword)

        // return the email and skills
        res.status(200).json({ user })
    } catch (error) { // catch any error that pops up during the process
        // return the error message in json
        res.status(400).json({error: error.message})
    }
}

// DELETE a user
const deleteUser = async (req, res) => {
    const { email } = req.body
  
    try {
        // invoke deleteUser function in userModel.js
        const user = await User.deleteUser(email)

        // return the email and skills
        res.status(200).json({ email })
    } catch (error) { // catch any error that pops up during the process
        // return the error message in json
        res.status(400).json({error: error.message})
    }
}

// EXPORT the functions
module.exports = {
    loginUser,
    signupUser,
    getAllUserInfo,
    getUserInfo,
    updateUserInfo,
    addUserSkill,
    updateUserSkill,
    deleteUserSkill,
    changeUserPassword,
    deleteUser
}