//=================================//
// MongoDB Schema for Organisation //
//=================================//

// 

// imports
const mongoose = require('mongoose'); // enforcing schema for mongodb

// create a new schema
const Schema = mongoose.Schema;

const organisationSchema = new Schema({
    orgname: {
        type: String,
        required: true, // compulsory property i.e. cannot be null
        unique: true // unique organisation name(?)
    },
    organisation_id: { // some identifier to be assigned to employees 
        type: String,
        default: ""
    },
    detail: {
        type: String,
        required: true //summary of organisation, compulsory property i.e. cannot be null
    },
    created_by: { // who created the project listing
        type: String,
        required: true
    }
}, {timestamps: true}); // datetime created and updated


// EXPORT
module.exports = mongoose.model('Organisation', organisationSchema) // .model builds out a Collection
