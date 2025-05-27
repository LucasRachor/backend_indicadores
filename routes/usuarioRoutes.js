const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const autenticar = require('../middleware/authMiddleware');
const verificarAdmin = require('../middleware/verificarAdmin');

router.get('/', usuarioController.listar);
router.post('/', verificarAdmin, usuarioController.criar);
router.put('/:id', verificarAdmin, usuarioController.editar);
router.patch('/:id/reset-senha', verificarAdmin, usuarioController.resetarSenha);
router.delete('/:id', usuarioController.excluir);

module.exports = router;