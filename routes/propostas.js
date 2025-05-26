const express = require('express');
const router = express.Router();
const { retornarDadosCrm } = require('../controllers/propostaController');

router.get('/propostas', retornarDadosCrm)

module.exports = router;
