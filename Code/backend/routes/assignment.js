//===========================================================//
// File which handles all the request to /api/assignment routes //
//===========================================================//

// imports
const express = require('express')

/* ============================================================================== *\
|   import controller functions from assignmentController.js in the controllers    |
|   folder these functions will be invoked and handled in the controller file      |
|   whenever the routes are requested.                                             |
\* ============================================================================== */
const { getAssignments, getSingleAssignment, createAssignment, deleteAssignment, updateAssignment } = require('../controllers/assignmentController')
const requireAuthentication = require('../middleware/requireAuthentication')

// invoke express router object
const router = express.Router()

// fire authentication check before moving on to the remaining routes
router.use(requireAuthentication)

// GET all assignment object @ /api/assignment/
router.get('/', getAssignments);

// GET a single assignment object @ /api/assignment/:id
router.get('/:id', getSingleAssignment)

// POST new assignment @ /api/assignment/
router.post('/', createAssignment)

// DELETE an assignment object @ /api/assignment/:id
router.delete('/:id', deleteAssignment)

// UPDATE an assignment object @ /api/assignment/:id
router.patch('/:id', updateAssignment)

// EXPORT router
module.exports = router