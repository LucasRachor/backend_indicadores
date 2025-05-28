const prisma = require('../prisma/client');

const listarPorSlug = async (req, res) => {
  const { slug } = req.params;

  try {
    const setoresSlug = await prisma.setor.findUnique({
      where: { slug },
      select: {
        id: true,
        nome: true,
        slug: true,
      }
    })

    return res.status(200).json({ setoresSlug })

  } catch (error) {
    res.send.status(500).json({
      message: error.message
    })
  }

}

const listar = async (req, res) => {
  const email = req.email;
  const perfilId = req.perfilId;

  const usuario = await prisma.usuario.findUnique({
    where: {
      email: email
    },
    select: {
      usuarioSetores: {
        select: {
          setorId: true,
        }
      }
    }
  })

  if (perfilId === 1) {
    const setorAdm = await prisma.setor.findMany();

    return res.json(setorAdm)

  } else if (perfilId === 4) {
    const setorVisualizador = await prisma.setor.findMany();

    return res.json(setorVisualizador)
  }

  else {
    const setorIds = usuario.usuarioSetores.map(user => user.setorId)
    const setores = await prisma.setor.findMany({
      where: {
        id: {
          in: setorIds
        },
      }
    });
    res.json(setores);
  }

};

const criar = async (req, res) => {
  const { nome, descricao, slug } = req.body;

  console.log(req.body)

  try {
    const novo = await prisma.setor.create({
      data: { nome, descricao, slug }
    });
    res.status(201).json(novo);
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
};

const editar = async (req, res) => {
  const { id } = req.params;
  const { nome, descricao } = req.body;
  try {
    const atualizado = await prisma.setor.update({
      where: { id: Number(id) },
      data: { nome, descricao }
    });
    res.json(atualizado);
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
};

const excluir = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.setor.delete({ where: { id: Number(id) } });
    res.json({ mensagem: 'Setor excluído com sucesso' });
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
};

module.exports = { listar, criar, editar, excluir, listarPorSlug };
