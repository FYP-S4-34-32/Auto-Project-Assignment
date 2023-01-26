//=============================//
// MongoDB Schema for Projects //
//=============================//

// imports
const mongoose = require('mongoose'); // enforcing schema for mongodb

// create a new schema
const Schema = mongoose.Schema;

const projectSchema = new Schema({
    organisation_id: { // can be organisation name
        type: String,
        default: null
    },
    title: {
        type: String,
        required: true, // compulsory property i.e. cannot be null
        unique: true // unique project title
    },
    description: {
        type: String,
        required: true
    },
    requirements: {
        type: String,
        required: true
    },
    skills: [{ // skills required by the project - set up to be an array of skills
        skill: String,
        competency: String
    }],
    threshold: { // number of people for this project
        type: Number,
        required: true,
        default: 0
    },
    assignment: { // indicate which assignment each project is a part of
        type: String,
        default: null
    },
    assigned_to: {
        assignment_id: String,
        employees: Array // employees who are working on the project
    },
    firstChoice: { // employee selected this project as their first choice
        type: Number
    },
    secondChoice: { // employee selected this project as their second choice
        type: Number
    },
    thirdChoice: { // employee selected this project as their third choice
        type: Number
    },
    notSelected: { // employee did not select this project as their top 3 preference
        type: Number
    },
    skills_and_competency_fulfilled: { // percentage of skills AND competency fulfilled by the employees assigned to this project
        type: Number
    },
    skills_fulfilled: { // percentage of skills fulfilled by the employees assigned to this project
        type: Number
    },
    completed: { // track whether project has been completed
        type: Boolean,
        default: false
    },
    created_by: { // who created the project listing
        type: String,
        required: true
    },
    active: {
        type: Boolean,
        default: false
    }
}, {timestamps: true}); // datetime created and updated

//==============================================================================================//

// static method to add new skill
projectSchema.statics.addNewSkill = async function(req) {

    console.log(req.body)
    const { id } = req.params // grab id from the address bar or request
    const { skill, competency } = req.body

    // check whether id is a valid mongoose type object
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw Error("Invalid Project ID" ) 
    }

    // get project document from id
    const project = await this.findOne({ _id: id })

    // check to see whether a user is found
    if (!project) {
        throw Error("No such project")
    } 

    // search for existence of skill in the project
    const skillExists = await this.find({ _id: id, 'skills.skill': skill }) // returns an array - have to check based on length whether it exists
    
    // check if skill has already been added
    if (skillExists.length !== 0) {
        throw Error("Skill has already been added")
    }

    // add new skill
    project.skills = [...project.skills, { skill, competency }]
    project.save()
    
    return project
}

// static methd to update skill
projectSchema.statics.updateSkill = async function(req) {
    const { id } = req.params // grab id from the address bar or request
    const { skill, competency } = req.body

    // check whether id is a valid mongoose type object
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw Error("Invalid Project ID" ) 
    }

    // get project document from id
    const project = await this.findOne({ _id: id })

    // check to see whether a user is found
    if (!project) {
        throw Error("No such project")
    }

    const updated = await this.findOneAndUpdate({ _id: id, 'skills.skill': skill }, {
        $set: {
            'skills.$.competency': competency
        }
    })

    return updated
}

// static methd to delete skill
projectSchema.statics.deleteSkill = async function(req) {
    const { id } = req.params
    const { skill } = req.body

    // check whether id is a valid mongoose type object
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw Error("Invalid Project ID" ) 
    }

    // get project document from id
    const project = await this.findOne({ _id: id })

    // check to see whether a user is found
    if (!project) {
        throw Error("No such project")
    }

    const deleted = await this.updateOne({ _id: id }, {
        $pull: {
            skills: {
                skill
            }
        }
    })

    return deleted
}

// EXPORT
module.exports = mongoose.model('Project', projectSchema) // .model builds out a Collection
