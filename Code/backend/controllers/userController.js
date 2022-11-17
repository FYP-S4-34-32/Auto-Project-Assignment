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
    //      "email": "example@email.com",
    // }    "password": "example password"
    // -> so we can destructure the request body and obtain the email and password value

    const {email, password} = req.body

    try {
        // invoke signup function and store return value(user document)
        const user = await User.signup(email, password)

        const role = user.role // user's role

        // create a jsonwebtoken
        const token = createToken(user._id)

        // return the user's email, role and the token we just generated in json format
        res.status(200).json({email, token, role})
    } catch (error) { // catch any error that pops up during the login process - refer to the login function in userModel.js
        // return the error message in json
        res.status(400).json({error: error.message})
    }
}

// GET all users info
const getAllUserInfo = async (req, res) => {
    const users = await User.find({}).sort({createdAt: 1}) // descending order

    res.status(200).json(users)
}

// GET user info
const getUserInfo = async (req, res) => {
    const { email } = (req.body) // grab email from the request object
    console.log(email)

    // get the document
    const userInfo = await User.getInfo(email)
    
    res.status(200).json(userInfo)
}

// UPDATE user info
const updateUserInfo = async (req, res) => {
    const { id } = req.params // grab id from the address bar or request

    // check whether id is a valid mongoose type object
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "Invalid User ID" }) 
    }

    // get the document
    const user = await User.findOneAndUpdate({ _id: id }, {
        ...req.body // spread the req.body
    }) // store the response of findOneAndUpdate() into user variable

    // user DOES NOT exist
    if (!user) {
        return res.status(404).json({ error: "No such user" })
    }

    // user EXISTS
    res.status(200).json(user)
}

// POST a new skill
const addUserSkill = async (req, res) => {
    const { id } = req.params
    const { name, competency } = req.body // req.body -> { "name": skillName, "competency": competencyLevel }
    console.log(name, competency)

    // id check
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({error: 'Invalid User ID'})
    }

    // search for user by id
    const user = await User.findById(id)

    // check to see whether a user is found
    if (!user) {
        return res.status(404).json({error: "No such user"});
    } 

    // search for user by id AND skill name in req.body
    const skillExists = await User.find({ _id: id, 'skills.name': name}) // returns an array - have to check based on length whether it exists
    
    // check if skill has already been added
    if (skillExists.length !== 0) {
        return res.status(404).json({error: "Skill has already been added"})
    }

    // add new skill
    user.skills = [...user.skills, { ...req.body }]
    user.save()
    
    res.status(200).json(user);
}

// UPDATE skill competency
const updateSkillCompetency = async (req, res) => {
    
}

// DELETE a user
const deleteUser = async (req, res) => {
    const { id } = req.params

    // id check
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({error: 'Invalid User ID'})
    }
  
    const user = await User.findOneAndDelete({_id: id})
  
    // check to see whether a user is found
    if (!user) {
      return res.status(404).json({error: "No such user"});
    } 
  
    // if user is found
    res.status(200).json(user);
}

// EXPORT the functions
module.exports = {
    loginUser,
    signupUser,
    getAllUserInfo,
    getUserInfo,
    updateUserInfo,
    addUserSkill,
    deleteUser
}