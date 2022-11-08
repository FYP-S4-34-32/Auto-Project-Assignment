//===========================================================//
// File which handles all the request to /api/project routes //
//===========================================================//

// imports
const express = require('express')

/* ============================================================================== *\
|   import controller functions from projectController.js in the controllers       |
|   folder these functions will be invoked and handled in the controller file      |
|   whenever the routes are requested.                                             |
\* ============================================================================== */
const { createProject, getProjects, getSingleProject, deleteProject, updateProject } = require('../controllers/projectController')

// invoke express router object
const router = express.Router()

// GET all projects @ /api/project/
router.get('/', getProjects);

// GET a single project @ /api/project/:id
router.get('/:id', getSingleProject);

// POST a new project @ /api/project/
router.post('/', createProject);

// DELETE a project @ /api/project/:id
router.delete('/:id', deleteProject);

// UPDATE a new project @ /api/project/:id
router.patch('/:id', updateProject);

// EXPORT router
module.exports = router