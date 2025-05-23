const express = require('express');
const router = express.Router();
const historicoController = require('../controllers/historicoController');
const extractEmailFromJWT = require('../middleware/extractInfo');

router.get('/', extractEmailFromJWT, historicoController.retornarHistoricos);

module.exports = router;