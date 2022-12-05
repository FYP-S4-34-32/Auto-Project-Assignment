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
        default: "Employee"
    },
    skills: [{ // skills of user - set up to be an array of skills
        skill: String,
        competency: String
    }],
    organisation_id: { // can be organisation name
        type: Number, // can be String/Number
        default: null
    },
    project_preference: [{ // user's project preference
        type: String,
        default: ""
    }],
    project_assigned: [{ // the project assigned to the user
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
userSchema.statics.signup = async function(name, email, password, role) {
    /* validation */
    // NAME OR EMAIL OR PASSWORD IS EMPTY
    if (!email || !password || !name) { 
        throw Error('All fields must be filled')
    }

    // ROLE field not selected
    if (!role) {
        throw Error('Please select the role')
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
    const user = await this.create({ name, email, password: hash, role })

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

// static method to retrieve ALL user info EXCEPT password
userSchema.statics.getAllUsers = async function() {
    return this.find({}).sort({createdAt: 1}).select('-password')
}

// static method to retrieve user info EXCEPT password
userSchema.statics.getOneUser = async function(email) {
    // returns the user document except the password field
    return this.findOne({ email }).select('-password')
}

// static method to update user info
userSchema.statics.updateInfo = async function(email, contact) {
    // get email - unique identifier
    // const { email } = req.body

    // get the document
    // const user = await this.findOneAndUpdate({ email }, {
    //     ...req.body // spread the req.body
    // }) // store the response of findOneAndUpdate() into user variable

    // get the user and update contact info
    const user = await this.findOneAndUpdate({email}, {contact})  

    // user DOES NOT exist
    if (!user) {
        throw Error("No such user")
    }

    // return updated user 
    return this.findOne({ email })
}

// static method to add new skill
userSchema.statics.addNewSkill = async function(email, skill, competency) {
    // search for user by email
    const user = await this.findOne({ email })

    // check to see whether a user is found
    if (!user) {
        throw Error("No such user")
    } 

    // search for user by email AND skill name in req.body
    const skillExists = await this.find({ email, 'skills.skill': skill}) // returns an array - have to check based on length whether it exists
    
    // check if skill has already been added
    if (skillExists.length !== 0) {
        throw Error("Skill has already been added")
    }

    // add new skill
    user.skills = [...user.skills, { skill, competency }]
    user.save()
    
    return user
}

// static method to update skill
userSchema.statics.updateSkill = async function(req) {
    const { email, skill, competency } = req.body

    // search for user by email
    const user = await this.findOne({ email })

    // check to see whether a user is found
    if (!user) {
        throw Error("No such user")
    } 

    const updated = await this.findOneAndUpdate({ email, 'skills.skill': skill }, 
    { $set: { 'skills.$.competency': competency}}
    )
     
    return this.findOne({ email })
}

// static method to delete skill
userSchema.statics.deleteSkill = async function(req) {
    const { email, skill } = req.body

    // search for user by email
    const user = await this.findOne({ email })

    // check to see whether a user is found
    if (!user) {
        throw Error("No such user")
    } 

    const deleteSkill = await this.updateOne({ email }, {
        $pull: { skills: { skill }}
    })

    return user
}

// static method to change password
userSchema.statics.changePassword = async function(email, currentPassword, newPassword) {
    // search for user by email
    const user = await this.findOne({email}) 

    // check to see whether a user is found
    if (!user) {
        throw Error("No such user")
    } 

    // check if current password matches
    const match = await bcrypt.compare(currentPassword, user.password)

    if (!match) {
        throw Error("Invalid current password")
    }

    // if current password matches, change password
    const salt = await bcrypt.genSalt(10) // generate password salt - value determines strength --> default == 10
    const hash = await bcrypt.hash(newPassword, salt) // hash the password

    // update password
    const update = await this.findOneAndUpdate({ email }, { password: hash })

    return this.findOne({ email })
}

// static method to delete user
userSchema.statics.deleteUser = async function(email) {
     // search for user by email
    const user = await this.findOne({ email })

    // check to see whether a user is found
    if (!user) {
        throw Error("No such user")
    } 
    
    const deleteUser = await this.deleteOne(user)

    return user
}


// EXPORT
module.exports = mongoose.model('User', userSchema) // .model builds out a Collection
