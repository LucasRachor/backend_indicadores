const prisma = require('../prisma/client');
const bcrypt = require('bcrypt');

async function salt(saltRounds) {
  saltRounds = 10
  return await bcrypt.genSalt(saltRounds)
}

// função para criar os usuarios e mapear suas jornadas!
const criar = async (req, res) => {
  const { nome, email, senha, jornadaTrabalho, statusSenha, perfilId, setorIds = [] } = req.body;

  // tenta criar o novo usuario
  try {
    const novoUsuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: await bcrypt.hash(senha, await salt()),
        statusSenha,
        jornadaTrabalho,
        perfil: { connect: { id: perfilId } },
        usuarioSetores: {
          create: setorIds.map((id) => ({
            setor: { connect: { id } }
          }))
        }
      }
    });

    // retorna um status code 201 (created) caso o usuario seja cadastrado!
    res.status(201).json({ mensagem: 'Usuário cadastrado com sucesso!', usuario: novoUsuario });
  } catch (error) {

    console.error('Erro ao criar usuário:', error);

    // retorna um erro 500 (internal server error) caso tenha acontecido algum erro interno!
    res.status(500).json({ erro: error.message });
  }
};

// Listar usuários com perfil e setores
const listar = async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      include: {
        usuarioSetores: { include: { setor: true } },
        perfil: true
      }
    });

    const formatado = usuarios.map((u) => ({
      id: u.id,
      nome: u.nome,
      email: u.email,
      statusSenha: u.statusSenha,
      perfilId: u.perfilId,
      perfil: u.perfil?.nome,
      jornadaTrabalho: u.jornadaTrabalho,
      setorIds: u.usuarioSetores.map((s) => s.setorId)
    }));

    res.json(formatado);
  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({ erro: 'Erro ao listar usuários' });
  }
};

// Editar usuário
const editar = async (req, res) => {
  const { id } = req.params;
  const { nome, email, senha, jornadaTrabalho, statusSenha, perfilId, setorIds = [] } = req.body;

  try {
    await prisma.usuarioSetor.deleteMany({ where: { usuarioId: Number(id) } });

    const atualizado = await prisma.usuario.update({
      where: { id: Number(id) },
      data: {
        nome,
        email,
        jornadaTrabalho,
        statusSenha,
        perfil: { connect: { id: perfilId } },
        ...(senha && { senha: await bcrypt.hash(senha, 10), statusSenha: true }),
        usuarioSetores: {
          create: setorIds.map((id) => ({
            setor: { connect: { id } }
          }))
        }
      }
    });

    res.json({ mensagem: 'Usuário atualizado com sucesso!', usuario: atualizado });
  } catch (error) {
    console.error('Erro ao editar usuário:', error);
    res.status(400).json({ erro: error.message });
  }
};

// Excluir usuário
const excluir = async (req, res) => {
  const { id } = req.params;

  try {
    // Remove vínculos com setores antes de deletar
    await prisma.usuarioSetor.deleteMany({ where: { usuarioId: Number(id) } });

    await prisma.usuario.delete({ where: { id: Number(id) } });

    res.json({ mensagem: 'Usuário excluído com sucesso!' });
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    res.status(400).json({ erro: error.message });
  }
};

// Resetar status de senha
const resetarSenha = async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.usuario.update({
      where: { id: Number(id) },
      data: {
        statusSenha: false,
        senha: await bcrypt.hash('senha123', await salt()),
      }
    });

    res.json({ mensagem: 'Senha resetada com sucesso.' });
  } catch (error) {
    console.error('Erro ao resetar senha:', error);
    res.status(400).json({ erro: error.message });
  }
};

module.exports = { listar, criar, editar, excluir, resetarSenha };
