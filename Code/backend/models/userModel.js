//==========================//
// MongoDB Schema for Users //
//==========================//

// Personal Details: Name, Contact, Email, (anything else?)
// Login Details: Email, Password
// Other Details: Organisation_ID, Skills, Role

// imports
const mongoose = require('mongoose'); // enforcing schema for mongodb
const bcrypt = require('bcrypt'); // hashing passwords
const validator = require('validator') // validates email, password

// create a new schema
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        default: ""
    },
    contact: {
        type: Number,
        default: null
    },
    email: {
        type: String,
        required: true, // compulsory property i.e. cannot be null
        unique: true // unique email
    },
    password: {
        type: String,
        required: true // compulsory property i.e. cannot be null
    },
    role: {
        type: String,
        required: true,
        default: "Employee" // default value for every user document created
    },
    skills: [{ // skills of user - set up to be an array of skills
        type: String,
        default: ""
    }],
    organisation_id: { // can be organisation name
        type: Number, // can be String/Number
        default: null
    },
    project_id: [{ // the project assigned to the user
        type: String,
        default: ""
    }]
    // MIGHT NEED TO INCLUDE A COUPLE MORE FIELDS TO TRACK PASSWORD CHANGE e.g. how many days till password has to be changed
}, {timestamps: true}); // datetime created and updated

//=================================================================================================================================//
// SIGNUP USER: static signup method - has to be regular function instead of arrow function because of the usage of 'this' keyword
// 1. VALIDATE whether email of password FIELD IS EMPTY
// 2. VALIDATE the email
// 3. VALIDATE the STRENGTH of the password
// 4. CHECK whether email is UNIQUE
// 5. GENERATE salt and HASH the password
// 6. CREATE a new user document and store it to our database in the schema format specified above
// 7. RETURNS the USER DOCUMENT in the format of the schema
//=================================================================================================================================//
userSchema.statics.signup = async function(email, password) {
    /* validation */
    // EMAIL OR PASSWORD IS EMPTY
    if (!email || !password) { 
        throw Error('All fields must be filled')
    }

    // NOT A VALID EMAIL
    if (!validator.isEmail(email)) {
        throw Error('Email is not valid')
    }

    // STRENGTH OF PASSWORD
    // if (!validator.isStrongPassword(password)) {
    //     throw Error('Password not strong enough')
    // }

    // check whether email exist in the database
    const exists = await this.findOne({ email })

    if (exists) { // DUPLICATE EMAIL - NOT ALLOWED
        throw Error('Email already in use')
    }
    
    const salt = await bcrypt.genSalt(10) // generate password salt - value determines strength --> default == 10
    const hash = await bcrypt.hash(password, salt) // hash the password

    // save user to the database
    const user = await this.create({ email, password: hash })

    console.log(user)

    // returns the user document we just created
    return user
}


//===============================================================================================================================//
// LOGIN USER: static login method - has to be regular function instead of arrow function because of the usage of 'this' keyword
// 1. VALIDATE whether email of password FIELD IS EMPTY
// 2. FIND whether there is a MATCHING email in our database
// 3. IF a user document is NOT found, means the email does not exist in our database
// 4. IF a user is FOUND, COMPARE the hash of the PASSWORD we receive to the password in our database
// 5. IF passwords hashes MATCH, login SUCCESSFUL
// 6. RETURNS the USER DOCUMENT in the format of the schema
//===============================================================================================================================//

userSchema.statics.login = async function(email, password) {
    // validation - email and/or password empty
    if (!email || !password) {
        throw Error('All fields must be filled')
    }

    const user = await this.findOne({ email })

    // if user not found
    if (!user) {
        throw Error('Invalid login credentials')
    }

    // if user found - try to match password
    const match = await bcrypt.compare(password, user.password) // (password passed in, password in the db)

    // if no match
    if (!match) {
        throw Error('Invalid login credentials')
    }

    // returns the user document we just created
    return user
}

// static method to retrieve user info - TESTING
userSchema.statics.getInfo = async function(email) {
    // returns the user document except the password field
    return this.findOne({ email }).select('-password');
}

// delete user
userSchema.statics.deleteUser = async function(email) {

}


// EXPORT
module.exports = mongoose.model('User', userSchema) // .model builds out a Collection
