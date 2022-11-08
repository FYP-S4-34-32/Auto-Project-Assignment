//=============================//
// MongoDB Schema for Projects //
//=============================//

// imports
const mongoose = require('mongoose'); // enforcing schema for mongodb

// create a new schema
const Schema = mongoose.Schema;

const projectSchema = new Schema({
    organisation_id: { // can be organisation name
        type: Number // can be String/Number
    },
    title: {
        type: String,
        required: true, // compulsory property i.e. cannot be null
        unique: true // unique project title
    },
    description: {
        type: String,
        required: true // compulsory property i.e. cannot be null
    },
    skills: [{ // skills required by the project - set up to be an array of skills
        type: String
    }]
}, {timestamps: true}); // datetime created and updated


// EXPORT
module.exports = mongoose.model('Project', projectSchema) // .model builds out a Collection
