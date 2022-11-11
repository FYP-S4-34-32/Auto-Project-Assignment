//==============================================================//
// File which does the heavylifting according to route requests // --> TEMPLATE ONLY, A LOT OF CHANGES TO BE MADE
//==============================================================//

// imports
const Project = require('../models/projectModel') // MongoDB model created in projectModel.js in the models folder
const mongoose = require('mongoose') // mongoose package for mongodb

// GET all projects
const getProjects = async (req, res) => {
    const projects = await Project.find({}).sort({createdAt: -1}) // descending order

    res.status(200).json(projects)
}


// GET a single project
const getSingleProject = async (req, res) => {
    // get id from address bar
    const { id } = req.params

    // check whether id is a mongoose type object
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({error: 'Invalid Project ID'})
    }

    const project = await Project.findById(id)

    // if document does not exist
    if (!project) {
        return res.status(404).json({error: "No such project"});
    }

    // document found
    res.status(200).json([project])
}


// CREATE new project
const createProject = async (req, res) => {
    const { title, description } = req.body

    let emptyFields = []
  
    if (!title) {
      emptyFields.push('title')
    }
    if (!description) {
      emptyFields.push('description')
    }
    if (emptyFields.length > 0) {
      return res.status(400).json({ error: 'Please fill in all fields', emptyFields })
    }
  
    // add to the database
    try {
      const project = await Project.create({ title, description })
      res.status(200).json(project)
    } catch (error) {
      res.status(400).json({ error: error.message })
    }
}


// DELETE a project
const deleteProject = async (req, res) => {
    const { id } = req.params

    // id check
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({error: 'Invalid Project ID'})
    }
  
    const project = await Project.findOneAndDelete({_id: id})
  
    // check to see whether a project is found
    if (!project) {
      return res.status(404).json({error: "No such project"});
    } 
  
    // if project is found
    res.status(200).json(project);
}



// UPDATE a project
const updateProject = async (req, res) => {
    const { id } = req.params // grab id from the address bar or request

    // check whether id is a valid mongoose type object
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({ error: "Invalid Project ID" }) 
    }

    // get the document
    const project = await Project.findOneAndUpdate({ _id: id }, {
        ...req.body // spread the req.body
    }) // store the response of findOneAndUpdate() into project variable

    // project DOES NOT exist
    if (!project) {
        return res.status(404).json({ error: "No such project" })
    }

    // project EXISTS
    res.status(200).json(project)
}



// export functions
module.exports = {
    getProjects,
    getSingleProject,
    createProject,
    deleteProject,
    updateProject
}