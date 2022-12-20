//=================================//
// MongoDB Schema for Organisation //
//=================================//

// 

// imports
const mongoose = require('mongoose'); // enforcing schema for mongodb

// create a new schema
const Schema = mongoose.Schema;

const organisationSchema = new Schema({
    orgName: {
        type: String,
        required: true, // compulsory property i.e. cannot be null
        unique: true // unique organisation name(?)
    },
    code: { // some identifier to be assigned to employees 
        type: String,
        default: ""
    },
    detail: {
        type: String,
        required: true //summary of organisation, compulsory property i.e. cannot be null
    }
}, {timestamps: true}); // datetime created and updated


// EXPORT
module.exports = mongoose.model('Organisation', organisationSchema) // .model builds out a Collection
