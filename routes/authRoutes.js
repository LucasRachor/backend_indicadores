const express = require('express');
const router = express.Router();
const { login, validateUser } = require('../controllers/authController');

router.post('/login', login);
router.get('/validar', validateUser)

module.exports = router;

