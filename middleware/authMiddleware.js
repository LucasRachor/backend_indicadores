const jwt = require('jsonwebtoken');
const prisma = require('../prisma/client');

const autenticar = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token malformado ou ausente' });
  }

  const token = authHeader.split(' ')[1];

  // ✅ TRATAMENTO DO TOKEN FAKE DEVE VIR PRIMEIRO
  if (token === 'token_fake_dev') {
    console.log('[DEV] Token fake aceito');
    req.usuario = {
      id: 999,
      nome: 'Paulo Pereira',
      email: 'paulo.pereira@fieam.org.br',
      perfil: { nome: 'Administrador', tipo: 'Administrador' }
    };
    return next(); // <-- isso garante que jwt.verify nunca será chamado
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const usuario = await prisma.usuario.findUnique({
      where: { id: decoded.id },
      include: { perfil: true }
    });

    if (!usuario) return res.status(401).json({ erro: 'Usuário não encontrado' });

    req.usuario = usuario;
    next();
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ erro: 'Sessão expirada. Por favor, faça login novamente.' });
    }


    res.status(401).json({ erro: 'Token inválido' });
  }
};

module.exports = autenticar;
