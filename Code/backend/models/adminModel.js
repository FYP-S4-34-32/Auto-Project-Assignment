// Enforcing schema for mongodb
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator')

const Schema = mongoose.Schema;

// ----------------------------------------------------------
// Admin user schema
// ----------------------------------------------------------

const adminSchema = new Schema({
    adminEmail: {
        type: String,
        required: true,
        unique: true // unique username/email
    },  
    adminPassword: {
        type: String,
        required: true
    }
}, {timestamps: true});

adminSchema.statics.adminLogin = async function(adminEmail, adminPassword) {
    // validation - email and/or password empty
    if (!adminEmail || !adminPassword) {
        throw Error('All fields must be filled')
    }

    const admin = await this.findOne({ adminEmail })

    // if user not found
    if (!admin) {
        throw Error('Invalid login credentials')
    }
 
    // for development only - change to hash above before deployment
    if (adminPassword !== admin.adminPassword)
    {
        throw Error('Invalid login credentials')
    }

    return admin
}


module.exports = mongoose.model('Admin', adminSchema)