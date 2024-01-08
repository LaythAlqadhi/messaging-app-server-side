const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

// POST request to sign up or create a new user.
router.post('/user/signup', userController.user_signup_post);

// POST request to log in the user.
router.post('/user/signin', userController.user_signin_post);

// GET request for one user.
router.get('/user/:userId', userController.user_get);

// GET request for list of all users.
router.get('/users', userController.users_get);

module.exports = router;
