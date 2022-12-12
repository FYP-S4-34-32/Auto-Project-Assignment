//========================================================//
// File which handles all the request to /api/user routes //
//========================================================//

// imports
const express = require('express')

/* ============================================================================== *\
|   import controller functions from userController.js in the controllers folder   |
|   these functions will be invoked and handled in the controller file whenever    |
|   the routes are requested. e.g. /api/user/login will invoke the loginUser       |
|   function in userController.js                                                  |
\* ============================================================================== */
const { getSkills, addSkill, deleteSkill } = require('../controllers/skillController')

// invoke express router object
const router = express.Router()

// GET all skills @ /api/skill/
router.get('/', getSkills)

// POST a new skill @ /api/skill/
router.post('/', addSkill)

// DELETE a skill @ /api/skill/
router.delete('/:id', deleteSkill)



// EXPORT router
module.exports = router