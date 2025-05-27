const jwt = require('jsonwebtoken');
const prisma = require('../prisma/client');
const bcrypt = require('bcrypt');

const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Usuário e senha são obrigatórios' });
  }

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { email: username },
      include: {
        perfil: true,
        usuarioSetores: { include: { setor: true } }
      }
    });

    if (!usuario) {
      return res.status(401).json({ message: 'Usuário ou senha inválida' });
    }

    const validPassword = await bcrypt.compare(password, usuario.senha);

    if (!validPassword) {

      res.status(401).json({
        message: "Usuario ou senha inválida"
      })

    }

    if (validPassword) {

      const token = jwt.sign(
        { id: usuario.id, perfilId: usuario.perfilId, name: usuario.email },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      return res.json({
        token,
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          perfil: usuario.perfil.tipo,
          statusSenha: usuario.statusSenha,
          setorIds: usuario.usuarioSetores.map(s => s.setorId)
        }
      });
    }

  } catch (error) {
    console.error('Erro no login master:', error);
    return res.status(500).json({ message: 'Erro no login master', erro: error.message });
  }

}

const validateUser = async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const isValid = jwt.verify(token, process.env.JWT_SECRET)

    if (isValid) {
      const usuario = await prisma.usuario.findUnique({
        where: { email: isValid.name },
        include: {
          perfil: true,
          usuarioSetores: { include: { setor: true } }
        },
      });

      res.status(200).json({
        message: "token válido",
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          perfil: usuario.perfil.tipo,
          statusSenha: usuario.statusSenha,
          setorIds: usuario.usuarioSetores.map(s => s.setorId)
        }
      })
    }

  } catch (error) {
    console.log(error)
    res.status(401).json({
      message: "Token inválido!"
    })
  }
}

// Atualizar token
const refreshToken = async (req, res) => {
  const { userId } = req.body;

  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: Number(userId) },
      include: {
        perfil: true,
        usuarioSetores: { include: { setor: true } }
      }
    });

    if (!usuario) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const token = jwt.sign(
      { id: usuario.id, perfilId: usuario.perfilId },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.json({
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil.tipo,
        statusSenha: usuario.statusSenha,
        setorIds: usuario.usuarioSetores.map(s => s.setorId)
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao gerar novo token', erro: error.message });
  }
};

module.exports = { login, refreshToken, validateUser };
