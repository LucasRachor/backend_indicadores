const express = require('express');
const router = express.Router();
const jornadaController = require('../controllers/jornadaController');

router.post('/criar-jornada', jornadaController.criarJornada);
router.put('/editar-jornada/:id', jornadaController.editarJornada);
router.get('/retornar-jornadas', jornadaController.retornarJornadas);
router.get('/retornar-resumo/:setorId', jornadaController.retornarResumoSetor);

module.exports = router;
