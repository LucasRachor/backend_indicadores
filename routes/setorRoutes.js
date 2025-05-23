const express = require('express');
const router = express.Router();
const { listar, criar, editar, excluir, listarPorSlug } = require('../controllers/setorController');
const autenticar = require('../middleware/authMiddleware');
const verificarAdmin = require('../middleware/verificarAdmin');
const extractEmailFromJWT = require('../middleware/extractInfo');

router.get('/', extractEmailFromJWT, autenticar, listar);
router.post('/', autenticar, criar);
router.get('/:slug', autenticar, listarPorSlug);
router.put('/:id', autenticar, editar);
router.delete('/:id', autenticar, verificarAdmin, excluir);

module.exports = router;
