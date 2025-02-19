const jwt = require('jsonwebtoken')

const AuthenticateUser = (req, res, next) => {
    const token = req.header('Authorization')?.split(" ")[1]

    if (!token) {
        return res.status(400).json({ message: 'Access denied. No token provided.' })
    }

    try {
        const decoded = jwt.verify(token, process.env.TOKEN_SECRET)
        req.user = decoded  // Store the decoded data in the request object (e.g., user ID)
        next()  // Proceed to the next middleware or route handler
    } catch (err) {
        console.error({ message: 'Invalid or expired token', err })
        res.status(400).json({ message: 'Invalid or expired token' })
    }
}

module.exports = AuthenticateUser
