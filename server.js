const express = require('express')
const app = express()
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const userRoutes = require('./routes/userRoutes')
const postRoutes = require('./routes/postRoutes')
const connectDB = require('./database/connect')

// Database
connectDB()

// Middleware
dotenv.config()
app.use(express.json())

app.use('/user', userRoutes)
app.use('/post', postRoutes)

app.get('/', (req, res) => {
    res.send('hello world')
})

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Server is running in port ${port}`)
})