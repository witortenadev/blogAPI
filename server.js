const express = require('express')
const app = express()
const dotenv = require('dotenv')
const userRoutes = require('./routes/userRoutes')
const postRoutes = require('./routes/postRoutes')
const connectDB = require('./database/connect')
const cors = require('cors')

// Database
connectDB()

// Middleware
app.use(cors())
dotenv.config()
app.use(express.json())

app.use('/user', userRoutes)
app.use('/post', postRoutes)

app.get('/', (req, res) => {
    res.send("Hello world!")
})

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Server is running in port ${port}`)
})
