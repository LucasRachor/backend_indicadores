const express = require('express');
const router = express.Router();
const { register, login, userInfo } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.get('/me', userInfo)

module.exports = router;

