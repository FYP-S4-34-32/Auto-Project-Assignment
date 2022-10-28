// entry file for backend server

// fetch env variables
require('dotenv').config()

// imports
const express = require('express')
const mongoose = require('mongoose')
const userRoutes = require('./routes/user')

// app
const app = express()

// middleware
app.use(express.json()) // logs request to express object

app.use((req, res, next) => {
    console.log(req.path, req.method) // logging requests as they come in
    next()
})

// register route handler
app.use('/api/user', userRoutes);

// connect to MongoDB and listen for requests
mongoose.connect(process.env.MONGO_URI)
        .then(() => {
            // only starts listening when database is connected
            app.listen(process.env.PORT, () => {
                console.log('Connected to MongoDB and Listening on port', process.env.PORT);
            });
        })
        .catch((error) => {
            console.log(error);
        })


