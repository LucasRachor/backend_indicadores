const prisma = require('../prisma/client');

const listar = async (req, res) => {
  const perfis = await prisma.perfil.findMany();
  res.json(perfis);
};

const criar = async (req, res) => {
  const { nome, detalhes, tipo } = req.body;
  try {
    const novo = await prisma.perfil.create({
      data: { nome, detalhes, tipo }
    });
    res.status(201).json(novo);
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
};

const editar = async (req, res) => {
  const { id } = req.params;
  const { nome, detalhes, tipo } = req.body;
  try {
    const atualizado = await prisma.perfil.update({
      where: { id: Number(id) },
      data: { nome, detalhes, tipo }
    });
    res.json(atualizado);
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
};

const excluir = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.perfil.delete({ where: { id: Number(id) } });
    res.json({ mensagem: 'Perfil excluído com sucesso' });
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
};

module.exports = { listar, criar, editar,excluir };
