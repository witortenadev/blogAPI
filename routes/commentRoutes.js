const express = require('express')
const router = express.Router()
const Comment = require('../database/models/Comment')
const authenticate = require('../middleware/jwtAuthentication')

// Get all comments
router.get('/', async (req, res) => {
    try {
        const comments = await Comment.find()
        if (!comments) {
            return res.status(404).json({ message: "No comments found" })
        }
        res.status(200).json(comments)
    } catch (e) {
        return res.status(500).json({ message: e.message })
    }
});

// Get comment by post
router.get('/getCommentsByPost:id', async (req, res) => {
    const postId = req.params.id
    try {
        const comments = await Comment.find({ post: postId })
        if (!comments) {
            return res.status(404).json({ message: "No comments found" })
        }
        res.status(200).json(comments)
    } catch (e) {
        return res.status(500).json({ message: e.message })
    }
});

// Create comment
router.post('/create', authenticate, async (req, res) => {
    const { post, content } = req.body

    if(!post || !content) {
        return res.status(400).json({ message: "The fields author, post and content are required for a comment." })
    }

    try {
        const newComment = new Comment({
            content: content,
            author: req.user.userId,
            post: post
        })
        await newComment.save();

        res.status(201).json({ message: "Created new comment", comment: newComment })
    } catch (e) {
        res.status(500).json({ message: e.message })
    }
});

router.delete('/delete/:id', authenticate, async (req, res) => {
    const commentId = req.params.id

    try{
        const comment = await Comment.findById(commentId)

        // If no comment is found
        if (!comment) {
            return res.status(404).json({ message: "No comment found." })
        }
        // Check if the user is the author
        if (comment.author.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'You can only delete your own posts.' })
        }

        // Delete the comment using deleteOne()
        await comment.deleteOne()
        res.status(204).json({ message: "Comment deleted successfully." })
    } catch(e) {
        res.status(500).json({ message: e.message })
    }
});

module.exports = router;
