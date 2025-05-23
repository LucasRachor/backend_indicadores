const express = require('express');
const router = express.Router();
const { listar, criar, editar, excluir } = require('../controllers/perfilController');
const autenticar = require('../middleware/authMiddleware');
const verificarAdmin = require('../middleware/verificarAdmin');

router.get('/', autenticar, listar);
router.post('/', autenticar, criar);
router.put('/:id', autenticar, editar);
router.delete('/:id', autenticar, verificarAdmin, excluir);

module.exports = router;
