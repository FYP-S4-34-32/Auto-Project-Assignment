//=======================================//
// MongoDB Schema for Project Assignment //
//=======================================//

// 

// imports
const mongoose = require('mongoose'); // enforcing schema for mongodb

// create a new schema
const Schema = mongoose.Schema;

const assignmentSchema = new Schema({
    // admin must insert a title for a particular assignment phase to differentiate OR
    // auto-increment id everytime a new assignment phase is created
    title: {
        type: String,
        required: true,
        unique: true
    },
    organisation_id: { // assignment object tied to each unique organisation
        type: String,
        required: true, // compulsory property i.e. cannot be null
    },
    start_date: {
        type: Date,
        default: Date.now() // when the object is created
    },
    end_date: {
        type: Date,
        default: function() { // 7 days after the object is created
            return new Date(this.start_date.getTime() + 7 * 24 * 60 * 60 * 1000)
        }
    },
    projects: [{ // project title as identifier
        type: String,
    }],
    threshold: { // number of projects each employee can take
        type: Number,
        required: true
    },
    employees: [{ // can use email as identifier
        type: String,
    }],
    first_choice: {
        type: Number
    },
    second_choice: {
        type: Number
    },
    third_choice: {
        type: Number
    },
    not_selected: {
        type: Number
    },
    not_assigned: {
        type: Number
    },
    created_by: { // who created the assignment phase - admin email OR _id
        type: String,
        required: true
    },
    active: { // check whether assignment phase is still active or not
        type: Boolean,
        default: false // false by default - prep phase before making it active
    }
}, {timestamps: true}); // datetime created and updated


// EXPORT
module.exports = mongoose.model('Assignment', assignmentSchema) // .model builds out a Collection
