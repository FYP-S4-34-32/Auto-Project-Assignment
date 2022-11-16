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
const { loginUser, signupUser, getAllUserInfo, getUserInfo, updateUserInfo, deleteUser } = require('../controllers/userController')

// invoke express router object
const router = express.Router()

// POST a new user @ /api/user/login
router.post('/login', loginUser)

// POST a new user @ /api/user/signup
router.post('/signup', signupUser)

// GET ALL user info @ /api/user/allprofile
router.get('/allprofile', getAllUserInfo)

// GET user info @ /api/user/profile
router.get('/profile', getUserInfo)

// UPDATE user info @ /api/user/:id
router.patch('/:id', updateUserInfo)

// DELETE a user @ /api/user/:id
router.delete('/:id', deleteUser)

// EXPORT router
module.exports = router