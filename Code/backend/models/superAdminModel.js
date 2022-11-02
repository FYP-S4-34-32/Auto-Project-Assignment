// Enforcing schema for mongodb
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator')

const Schema = mongoose.Schema;

// ----------------------------------------------------------
// Super admin user schema
// ----------------------------------------------------------

const superAdminSchema = new Schema({
    superAdminEmail: {
        type: String,
        required: true,
        unique: true // unique username/email
    },
    superAdminPassword: {
        type: String,
        required: true
    }
}, {timestamps: true});

superAdminSchema.statics.superAdminlogin = async function(superAdminEmail, superAdminPassword) {
    // validation - email and/or password empty
    if (!superAdminEmail || !superAdminPassword) {
        throw Error('All fields must be filled')
    }

    const superAdmin = await this.findOne({ superAdminEmail })
    
    // if super admin not found
    if (!superAdmin) {
        throw Error('Invalid login credentials')
    }

    
    // for development only - change to hash above before deployment
    if (superAdminPassword !== superAdmin.superAdminPassword) {
        throw Error('Invalid login credentials')
    }

    return superAdmin
}



module.exports = mongoose.model('SuperAdmin', superAdminSchema)