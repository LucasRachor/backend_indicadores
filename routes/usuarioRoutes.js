const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const autenticar = require('../middleware/authMiddleware');
const verificarAdmin = require('../middleware/verificarAdmin');

router.get('/', autenticar, usuarioController.listar);
router.post('/', autenticar, verificarAdmin, usuarioController.criar);
router.put('/:id', autenticar, verificarAdmin, usuarioController.editar);
router.patch('/:id/reset-senha', autenticar, verificarAdmin, usuarioController.resetarSenha);
router.delete('/:id', autenticar, usuarioController.excluir);

module.exports = router;