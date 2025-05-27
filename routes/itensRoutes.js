const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');

router.post('/', itemController.cadastrarItem);
router.get('/', itemController.listarItens);
router.get('/valor/:id', itemController.listarValorItens);
router.get('/:id', itemController.buscarItemPorId);
router.put('/:id', itemController.atualizarItem);
router.put('/atualizar-valor/:id', itemController.atualizarValoresItem);
router.delete('/:id', itemController.excluirItem);

module.exports = router;