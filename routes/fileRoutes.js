const express = require('express')
const router = express.Router()
const Post = require('../database/models/Post')
const path = require('path');
const Image = require('../database/models/Image')
const authenticateUser = require('../middleware/jwtAuthentication')

// Middleware
const authenticate = require('../middleware/jwtAuthentication')

// Multer
const multer = require('multer');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({
    storage: storage,
    limits: {
      fileSize: 1 * 1024 * 1024 // Limit file size to 1MB
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = /jpeg|jpg|png|gif/; // Restrict to certain file types
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);
  
      if (extname && mimetype) {
        return cb(null, true); // File is allowed
      } else {
        return cb(new Error('Invalid file type'), false); // Reject file
      }
    }
  });
  

  router.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
      return res.status(400).send('No image file uploaded');
    }
  
    const image = new Image({
      filename: req.file.filename,
      path: req.file.path
    });
  
    try {
      await image.save();
      res.status(200).send('Image uploaded and saved successfully');
    } catch (error) {
      res.status(500).send('Error saving image to the database');
    }
  });

module.exports = router
