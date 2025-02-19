const express = require('express')
const router = express.Router()
const User = require('../database/models/User')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const authenticateUser = require('../middleware/jwtAuthentication')

// Middleware
require('dotenv').config()

router.get('/', authenticateUser, (req, res) => {
    res.send('Hello user')
})

router.post('/login', async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ message: "Email and Password are required." })
    }

    try {
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ message: 'User not found.' })
        }

        const validPassword = await bcrypt.compare(password, user.password)
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid password.' })
        }

        const token = jwt.sign({ userId: user._id, email: user.email }, process.env.TOKEN_SECRET, { expiresIn: '1h' })

        res.status(200).json({ message: "Logged in successfully", user, token })
    } catch (err) {
        console.error({ message: 'An error occurred logging the user.', err })
        res.status(500).json({ message: 'Error logging user' })
    }
})

router.post('/register', async (req, res) => {
    const { username, email, password } = req.body

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Username, Email, and Password are required.' })
    }

    try {
        const existingUser = await User.findOne({ email })
        if (existingUser) {
            return res.status(400).json({ message: 'Email is already taken.' })
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = new User({ username, email, password: hashedPassword })
        await newUser.save()

        res.status(201).json({ message: 'User registered successfully' })
    } catch (err) {
        console.error({ message: 'An error occurred creating the user.', err })
        res.status(500).json({ message: 'Error registering user' })
    }
})

module.exports = router
