const express = require('express')
const app = express()
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const userRoutes = require('./routes/userRoutes')
const postRoutes = require('./routes/postRoutes')
const fileRoutes = require('./routes/fileRoutes')
const connectDB = require('./database/connect')
const cors = require('cors')

// Database
connectDB()

// Middleware
app.use(cors())
dotenv.config()
app.use(express.json())

app.use('/file', fileRoutes)
app.use('/user', userRoutes)
app.use('/post', postRoutes)

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Create Post</title>
</head>
<body>
    <h1>Create a New Post</h1>
    <form id="create-post-form" action="/api/posts/create" method="POST" enctype="multipart/form-data">
        <div>
            <label for="title">Title:</label>
            <input type="text" id="title" name="title" required>
        </div>
        <div>
            <label for="content">Content:</label>
            <textarea id="content" name="content" required></textarea>
        </div>
        <div>
            <label for="file">Upload Image:</label>
            <input type="file" id="file" name="file" accept="image/jpeg, image/png, image/gif">
        </div>
        <div>
            <button type="submit">Create Post</button>
        </div>
    </form>

    <script>
        document.getElementById('create-post-form').addEventListener('submit', function (e) {
            e.preventDefault();  // Prevent form submission

            const formData = new FormData(this);

            fetch('/post/create', {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': 'Bearer token' // Set your JWT token here for authorization
                }
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if (data.message === 'Post created successfully.') {
                    alert('Post created successfully!');
                } else {
                    alert('Error: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Something went wrong.');
            });
        });
    </script>
</body>
</html>

`)
})

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`Server is running in port ${port}`)
})
