//=============================//
// MongoDB Schema for Projects //
//=============================//

// imports
const mongoose = require('mongoose'); // enforcing schema for mongodb

// create a new schema
const Schema = mongoose.Schema;

const projectSchema = new Schema({
    organisation_id: { // can be organisation name
        type: Number, // can be String/Number
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
    skills: [{ // skills required by the project - set up to be an array of skills
        skill: String,
        competency: String
    }],
    // threshold: { // number of people for this project
    //     type: Number
    //     required: true
    // }
}, {timestamps: true}); // datetime created and updated

//==============================================================================================//

// static method to add new skill
projectSchema.statics.addNewSkill = async function(req) {
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
