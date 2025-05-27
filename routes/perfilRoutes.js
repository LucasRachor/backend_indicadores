const express = require('express');
const router = express.Router();
const { listar, criar, editar, excluir } = require('../controllers/perfilController');
const autenticar = require('../middleware/authMiddleware');
const verificarAdmin = require('../middleware/verificarAdmin');

router.get('/', listar);
router.post('/', criar);
router.put('/:id', editar);
router.delete('/:id', verificarAdmin, excluir);

module.exports = router;
