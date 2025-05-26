const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

// alterações feitas para previnir a mudança do token
// agora a função vallida com as informações que vem do backend

const verifyAdmin = async (req, res, next) => {

  // pegamos o token do header da requisição
  let email = ''
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token não fornecido' });
  }

  // fazemos o decode do token
  const token = authHeader.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // verificamos se o campo name existe no token, se não, gera uma exceção
  if (!decoded.name) {
    return res.status(401).json({ message: 'Token inválido: e-mail ausente' });
  }

  email = decoded.name;

  // fazemos a busca do usuario no banco para saber o perfil que ele está vinculado
  const usuario = await prisma.usuario.findUnique({
    where: {
      email: email
    },
    select: {
      perfil: true,
    }
  })

  // verificamos se o banco retorna algum usuario, se não, gera uma exceção
  if (!usuario) {
    res.status(404).json({
      erro: 'Usuario não encontrado!'
    })
  }

  // se o perfil que vem do banco for diferente de 'administrador', gera uma exceção
  if (usuario.perfil.tipo !== 'Administrador') {
    return res.status(403).json({ erro: 'Acesso restrito ao administrador' });
  }
  next();
};

module.exports = verifyAdmin;