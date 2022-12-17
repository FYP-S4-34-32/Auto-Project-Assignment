//==============================================================//
// File which does the heavylifting according to route requests //
//==============================================================//

// imports
const Organisation = require('../models/organisationModel') // MongoDB model created in projectModel.js in the models folder
const mongoose = require('mongoose') // mongoose package for mongodb

// GET all organisations
const getOrganisations = async (req, res) => {
    const organisations = await Organisation.find({}).sort({createdAt: -1}) // descending order

    res.status(200).json(organisations)
}

// GET a single organisation
const getSingleOrganisation = async (req, res) => {
    // get id from address bar
    const { id } = req.params

    // check whether id is a mongoose type object
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(404).json({error: 'Invalid Organisation ID'})
    }

    const organisation = await Organisation.findById(id)

    // if document does not exist
    if (!organisation) {
        return res.status(404).json({error: "No such organisation"});
    }

    // document found
    res.status(200).json(organisation)
}

// CREATE new organisation
const createOrganisation = async (req, res) => {
    const { name, code, detail } = req.body
    // const { name, code, detail } = req.body

    let emptyFields = []
  
    if (!name) {
      emptyFields.push('name')
    }
    if (!code) {
        emptyFields.push('code')
      }
    if (!detail) {
      emptyFields.push('detail')
    }
  
    // add to the database
    try {

        const created_by = req.user.name // access to this is from the middleware requireAuthentication.js return value

      const organisation = await Organisation.create({ name, code, detail, created_by })
    //   const organisation = await Organisation.create({ name, code, detail, created_by })

      res.status(200).json(organisation)

    } catch (error) {

      res.status(400).json({ error: error.message })

    }
}

// DELETE an organisation
const deleteOrganisation = async (req, res) => {
    const { id } = req.params

    // id check
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({error: 'Invalid Organisation ID'})
    }
  
    const organisation = await Organisation.findOneAndDelete({_id: id})
  
    // check to see whether a project is found
    if (!organisation) {
      return res.status(404).json({error: "No such organisation"});
    } 
  
    // if project is found
    res.status(200).json(organisation);
}

//export functions
module.exports = {
    getOrganisations,
    getSingleOrganisation,
    createOrganisation,
    deleteOrganisation
}