const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const extractEmailFromJWT = require('../middleware/extractInfo');
const autenticar = require('../middleware/authMiddleware');

router.post('/', itemController.cadastrarItem);
router.get('/', extractEmailFromJWT, itemController.listarItens);
router.get('/valor/:id', itemController.listarValorItens);
router.get('/:id', itemController.buscarItemPorId);
router.put('/:id', itemController.atualizarItem);
router.put('/atualizar-valor/:id', autenticar, itemController.atualizarValoresItem);
router.delete('/:id', itemController.excluirItem);

module.exports = router;