const express = require('express');
const router = express.Router();
const autenticar = require('../middleware/authMiddleware');
const { atualizarValoresItem } = require('../controllers/atualizarItemController');


router.put('/atualizar-item/:id', autenticar, atualizarValoresItem);

module.exports = router;