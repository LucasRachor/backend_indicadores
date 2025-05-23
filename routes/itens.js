const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const extractEmailFromJWT = require('../middleware/extractInfo');
router.post('/', itemController.cadastrarItem);
router.get('/', extractEmailFromJWT, itemController.listarItens);
router.get('/valor/:id', itemController.listarValorItens);
router.get('/:id', itemController.buscarItemPorId);
router.put('/:id', itemController.atualizarItem);
router.delete('/:id', itemController.excluirItem);

module.exports = router;