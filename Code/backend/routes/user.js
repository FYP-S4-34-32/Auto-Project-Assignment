// require express package to make an instance of the express router
const express = require('express')

// import controller functions
const { loginUser, signupUser, getUserInfo, adminLoginUser, superAdminLoginUser } = require('../controllers/userController')
// const { superAdminLoginUser } = require('../controllers/userController')
// const { adminLoginUser } = require('../controllers/userController')

// invoke express router
const router = express.Router()

// login route - POST because we are sending data for each request
router.post('/login', loginUser)

// signup route - POST because we are sending data for each request
router.post('/signup', signupUser)

// homepage route - GET because we are retrieving data *JUST FOR TESTING
router.get('/:email', getUserInfo)

// Admin login route 
router.post('/AdminLogin', adminLoginUser)

// Super Admin login route
router.post('/SuperAdminLogin', superAdminLoginUser)

// export router
module.exports = router