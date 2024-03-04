const express = require('express');
const {register, login, getMe, logout, getAllUsers} = require('../controllers/auth'); //Get function from /controllers/auth

const router = express.Router(); //Get request from which method 

const {protect, authorize} = require('../middleware/auth');

router.post('/register', register); //If it is from post method and from /register path then do register function from above
router.post('/login', login);
router.get('/me', protect, getMe);
router.get('/logout', logout);
router.route('/all').get(protect, authorize('admin'), getAllUsers);

module.exports = router;
