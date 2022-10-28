const jwt = require('jsonwebtoken')
const User = require('../models/userModel')

const requireAuth = async (req, res, next) => { // request, response, point to the next middleware

    /* verify authentication */
    // grab the header
    const { authorization } = req.headers

    // check whether there is a jwt
    if (!authorization) {
        return res.status(401).json({error: 'Authorisation token required'})
    }

    // grab just the token value
    const token = authorization.split(' ')[1]

    // verify the token
    try {
        const { _id } = jwt.verify(token, process.env.SECRET) // grabs _id from jwt

        // find user in the database
        req.user = await User.findOne({ _id }).select('_id') // attach only the _id property to user
        
        next() // fires the next handler function

    } catch (error) {
        console.log(error)
        res.status(401).json({error: 'Request is not authorised'})
    }
}

module.exports = requireAuth