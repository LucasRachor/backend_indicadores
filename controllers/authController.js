const jwt = require('jsonwebtoken');
const prisma = require('../prisma/client');
// const ActiveDirectory = require('activedirectory2');

// // Configuração do LDAP
// const config = {
//   url: 'ldap://fieam.com.br',
//   baseDN: 'DC=fieam,DC=com,DC=br',
//   username: 'ldap',
//   password: 'admin@H3rcul35'
// };
// const ad = new ActiveDirectory(config);

const userInfo = async (req, res) => {

  try {

    const email = req.email

    const usuario = await prisma.usuario.findUnique({
      where: {
        email: email
      },
      include: {
        usuarioSetores: true
      }
    })

    res.status(200).json(usuario)

  } catch (err) {
    console.log(err)
    res.status(500).json({
      error: "Erro interno do servidor"
    })


  }

};

// Registro manual (opcional)
const register = async (req, res) => {
  const { nome, email, senha, perfilId, jornadaTrabalho } = req.body;

  try {
    const novoUsuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha,
        statusSenha: true,
        jornadaTrabalho: new Date(`1970-01-01T${jornadaTrabalho}`),
        perfil: { connect: { id: perfilId } }
      }
    });

    res.status(201).json(novoUsuario);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

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

// Login com LDAP ou fallback
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

    if (!usuario || usuario.senha !== password) {
      return res.status(401).json({ message: 'Usuário ou senha inválidos' });
    }

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

  } catch (error) {
    console.error('Erro no login master:', error);
    return res.status(500).json({ message: 'Erro no login master', erro: error.message });
  }

  // try {
  //   let usuario = await prisma.usuario.findUnique({
  //     where: { email: username },
  //     include: {
  //       perfil: true,
  //       usuarioSetores: { include: { setor: true } }
  //     }
  //   });

  //   if (!usuario) {
  //     const perfilVisualizador = await prisma.perfil.findUnique({ where: { id: 4 } });

  //     if (!perfilVisualizador) {
  //       throw new Error('Perfil Visualizador padrão não encontrado');
  //     }

  //     await prisma.setor.upsert({
  //       where: { id: 1 },
  //       update: {},
  //       create: {
  //         id: 1,
  //         nome: 'Setor Padrão',
  //         descricao: 'Setor padrão para novos usuários',
  //         tipo: 'Geral'
  //       }
  //     });

  //     usuario = await prisma.usuario.create({
  //       data: {
  //         nome: username,
  //         email: username,
  //         senha: password,
  //         statusSenha: true,
  //         jornadaTrabalho: new Date('1970-01-01T08:00:00Z'),
  //         perfil: { connect: { id: 4 } },
  //         usuarioSetores: {
  //           create: [{ setor: { connect: { id: 1 } } }]
  //         }
  //       },
  //       include: {
  //         perfil: true,
  //         usuarioSetores: true
  //       }
  //     });
  //   }

  //   const token = jwt.sign(
  //     { id: usuario.id, perfilId: usuario.perfilId },
  //     process.env.JWT_SECRET,
  //     { expiresIn: '1d' }
  //   );

  //   return res.json({
  //     token,
  //     usuario: {
  //       id: usuario.id,
  //       nome: usuario.nome,
  //       email: usuario.email,
  //       perfil: usuario.perfil?.tipo || 'Usuario_Visualizacao',
  //       statusSenha: usuario.statusSenha,
  //       setorIds: usuario.usuarioSetores.map(s => s.setorId)
  //     }
  //   });
  // } catch (error) {
  //   console.error('Erro no login LDAP:', error);
  //   return res.status(500).json({ message: 'Erro no login LDAP', erro: error.message });
  // }
}


module.exports = { login, register, refreshToken, userInfo };
