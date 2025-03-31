const express = require('express')
const router = express.Router()
const Post = require('../database/models/Post')
const User = require('../database/models/User')
const authenticate = require('../middleware/jwtAuthentication')

// Get All Posts by Author Route
router.get('/author/:authorId', async (req, res) => {
    const { authorId } = req.params

    try {
        // Find all posts by the given author ID
        const posts = await Post.find({ author: authorId }).populate('author', 'username email')

        // Check if no posts are found for the author
        if (!posts.length) {
            return res.status(404).json({ message: 'No posts found for this author.' })
        }

        // Send the posts as a response
        res.status(200).json({ posts })
    } catch (err) {
        console.error('Error fetching posts by author:', err)
        res.status(500).json({ message: 'Error fetching posts by author.' })
    }
})

// Get All Posts Route with Pagination
router.get('/all', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Calculate how many posts to skip based on the page number and limit
    const skip = (page - 1) * limit;

    try {
        // Fetch paginated posts from the database
        const posts = await Post.find()
            .skip(skip)         // Skip the posts based on the page number
            .limit(limit)       // Limit the number of posts per page
            .populate('author', 'username email');  // Populate author info (optional)

        // Check if no posts are found
        if (!posts.length) {
            return res.status(404).json({ message: 'No posts found.' });
        }

        // Get the total number of posts in the database to calculate the total pages
        const totalPosts = await Post.countDocuments();

        // Calculate the total number of pages
        const totalPages = Math.ceil(totalPosts / limit);

        // Send the posts, along with pagination information
        res.status(200).json({
            posts,
            currentPage: page,
            totalPages: totalPages,
            totalPosts: totalPosts,
        });
    } catch (err) {
        console.error('Error fetching posts:', err);
        res.status(500).json({ message: 'Error fetching posts.' });
    }
});

router.get('/most-liked', async (req, res) => {
    try {
        const posts = await Post.find().sort({ stars: -1 })
        if(!posts) {
            return res.status(404).json({ message: 'No found.' })
        }
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const paginatedPosts = posts.slice(skip, skip + limit);
        const totalPages = Math.ceil(posts.length / limit);

        res.status(200).json({
            posts: paginatedPosts,
            currentPage: page,
            totalPages: totalPages,
            totalPosts: posts.length,
        });
    } catch (err) {
        console.error('Error fetching most liked posts:', err)
        res.status(500).json({ message: 'Error fetching most liked posts.' })
    }
});

// Get Post by ID
router.get('/:id', async (req, res) => {
    const postId = req.params.id

    try {
        // Find the post by its ID
        const post = await Post.findById(postId).populate('author', 'username email')  // Populate author information (optional)

        // Check if the post exists
        if (!post) {
            return res.status(404).json({ message: 'Post not found.' })
        }

        // Send the post as the response
        res.status(200).json({ post })
    } catch (err) {
        console.error('Error fetching post:', err)
        res.status(500).json({ message: 'Error fetching post.' })
    }
})

router.post('/create', authenticate, async (req, res) => {
    const { title, content } = req.body;
    if (!title || !content) {
        return res.status(400).json({ message: 'Title and content are required.' });
    }

    try {
        const newPost = new Post({
            title,
            content,
            author: req.user.userId,
        });

        await newPost.save();
        res.status(201).json({ message: 'Post created successfully.', post: newPost });
    } catch (err) {
        console.error('Error creating post:');
        res.status(500).json({ message: 'Error creating post.', err });
    }
});

router.get('/star/:postId', authenticate, async (req, res) => {
    const { postId } = req.params;

    try {
        const post = await Post.findById(postId)
        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }
        
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

         if (user.starredPosts.includes(postId)) {
            post.stars -= 1;
            user.starredPosts = user.starredPosts.filter(id => id.toString() !== postId);
            await user.save();
            await post.save();
            return res.status(200).json({ message: 'Post unstarred successfully.' });
        }

        user.starredPosts.push(postId);
        post.stars += 1;
        await user.save();
        await post.save();
        
        res.status(200).json({ message: 'Post starred successfully.' });
    } catch (err) {
        console.error('Error starring post:', err);
        res.status(500).json({ message: 'Error starring post.' });
    }
})

// Edit Post Route
router.put('/edit/:id', authenticate, async (req, res) => {
    const postId = req.params.id
    const { title, content } = req.body

    try {
        const post = await Post.findById(postId)

        // Check if post exists
        if (!post) {
            return res.status(404).json({ message: 'Post not found.' })
        }

        // Check if the user is the author
        if (post.author.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'You can only edit your own posts.' })
        }

        // Update the post
        post.title = title || post.title
        post.content = content || post.content
        post.updatedAt = new Date()

        await post.save()
        res.status(200).json({ message: 'Post updated successfully.', post })
    } catch (err) {
        console.error('Error editing post:', err)
        res.status(500).json({ message: 'Error editing post.' })
    }
})

// Delete Post Route
router.delete('/delete/:id', authenticate, async (req, res) => {
    const postId = req.params.id

    try {
        const post = await Post.findById(postId)

        // Check if post exists
        if (!post) {
            return res.status(404).json({ message: 'Post not found.' })
        }

        // Check if the user is the author
        if (post.author.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'You can only delete your own posts.' })
        }

        // Delete the post using deleteOne() instead of remove()
        await post.deleteOne()
        res.status(200).json({ message: 'Post deleted successfully.' })
    } catch (err) {
        console.error('Error deleting post:', err)
        res.status(500).json({ message: 'Error deleting post.' })
    }
})

module.exports = router
