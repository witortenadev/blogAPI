const express = require('express')
const nodemailer = require('nodemailer')
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

router.get('/username/:id', async (req, res) => {
    const { id } = req.params

    try {
        const user = await User.findById(id).select('username')
        if (!user) {
            return res.status(404).json({ message: 'User not found.' })
        }

        res.status(200).json({ username: user.username })
    } catch (err) {
        console.error({ message: 'An error occurred fetching the username.', err })
        res.status(500).json({ message: 'Error fetching username' })
    }
})

router.get('/:id', authenticateUser, async (req, res) => {
    const { id } = req.params

    if (req.user.userId !== id) {
        return res.status(403).json({ message: 'Access denied.' })
    }

    try {
        const user = await User.findById(id)
        if (!user) {
            return res.status(404).json({ message: 'User not found.' })
        }

        res.status(200).json(user.select('-password -__v'))
    } catch (err) {
        console.error({ message: 'An error occurred fetching the user.', err })
        res.status(500).json({ message: 'Error fetching user' })
    }
})

router.get('/starred/:postId', authenticateUser, async (req, res) => {
    const { postId } = req.params
    const { userId } = req.user

    try {
        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ message: 'User not found.' })
        }
        
        let starredPosts = user.starredPosts || []
        if (starredPosts.includes(postId)) {
            res.status(200).json({ message: 'Post is starred', starred: true })
        } else {
            res.status(200).json({ message: 'Post is not starred', starred: false })
        }} catch (err) {
        console.error({ message: 'An error occurred fetching the user.', err })
        res.status(500).json({ message: 'Error fetching user' })
    }
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
        if (!user.isVerified) {
            return res.status(400).json({ message: 'Email not verified.' })
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
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Username, Email, and Password are required.' });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email is already taken.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({ username, email, password: hashedPassword, isVerified: false });
        await newUser.save();

        const emailToken = jwt.sign(
            { userId: newUser._id, email: newUser.email },
            process.env.EMAIL_TOKEN_SECRET,
            { expiresIn: '1h' }
        );

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const verificationUrl = `https://bloggyapi.onrender.com/verify/${emailToken}`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Email Verification',
            text: `Click this link to verify your email: ${verificationUrl}`,
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email:', error);
                return res.status(500).json({ message: 'Error sending email.', error });
            }
            console.log('Email sent:', info.response);
        });

        res.status(200).json({ message: 'Verification email sent!' });
    } catch (err) {
        console.error({ message: 'An error occurred creating the user.', err });
        res.status(500).json({ message: 'Error registering user' });
    }
});

router.get('/verify/:token', async (req, res) => {
    const { token } = req.params;
  
    try {
      // Verify the JWT token
      const decoded = jwt.verify(token, process.env.EMAIL_TOKEN_SECRET);
  
      // Find the user by the ID decoded from the token
      const user = await User.findOne({ _id: decoded.userId, email: decoded.email });
  
      if (!user) {
        return res.status(400).json({ message: 'Invalid token.' });
      }
  
      // Token expiration is already handled by jwt.verify
  
      // Mark the user as verified
      user.isVerified = true;
      await user.save();
  
      res.status(200).json({ message: 'Email successfully verified!' });
    } catch (err) {
      return res.status(400).json({ message: 'Invalid or expired token.' });
    }
  });

module.exports = router
