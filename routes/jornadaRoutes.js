const express = require('express');
const router = express.Router();
const jornadaController = require('../controllers/jornadaController');
const extractEmailFromJWT = require('../middleware/extractInfo');

router.post('/criar-jornada', jornadaController.criarJornada);
router.put('/editar-jornada/:id', jornadaController.editarJornada);
router.get('/retornar-jornadas', extractEmailFromJWT, jornadaController.retornarJornadas);
router.get('/retornar-resumo/:setorId', jornadaController.retornarResumoSetor);

module.exports = router;
