const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 3010;
const prisma = require('./prisma/client');
const authRoutes = require('./routes/authRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const setorRoutes = require('./routes/setorRoutes');
const perfilRoutes = require('./routes/perfilRoutes');
const itensRouter = require('./routes/itensRoutes');
const historicoRoutes = require('./routes/historicoRoutes')
const jornadaRoutes = require('./routes/jornadaRoutes');
const propostasRoute = require('./routes/propostas');

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

app.use('/api/propostas', propostasRoute);
app.use('/api/jornadas', jornadaRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/setores', setorRoutes);
app.use('/api/perfis', perfilRoutes);
app.use('/api/itens', itensRouter);
app.use('/api/historico', historicoRoutes);

app.get('/', (req, res) => res.send('API Online'));

app.listen(port, '0.0.0.0', async () => {
  console.log(`Servidor rodando na porta ${port}`);
  await criarPerfisPadrao();
  await criarUsuariosPadrao();
});

const criarPerfisPadrao = async () => {
  try {
    const perfis = [
      { id: 1, nome: 'Administrador', tipo: 'Administrador', detalhes: 'Perfil com acesso total' },
      { id: 2, nome: 'Editor', tipo: 'Usuario_Editor', detalhes: 'Pode editar informações' },
      { id: 3, nome: 'Líder', tipo: 'Lideres', detalhes: 'Visualiza dados do setor' },
      { id: 4, nome: 'Visualizador', tipo: 'Usuario_Visualizacao', detalhes: 'Acesso somente leitura' }
    ];

    for (const perfil of perfis) {
      await prisma.perfil.upsert({
        where: { id: perfil.id },
        update: {},
        create: perfil
      });
    }
    console.log('Perfis padrão garantidos');
  } catch (error) {
    console.error('Erro ao criar perfis padrão:', error);
  }
};

const criarUsuariosPadrao = async () => {
  try {
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email: 'master@fieam.org.br' }
    });

    if (!usuarioExistente) {
      console.log('Criando usuário master...');

      await prisma.setor.upsert({
        where: { id: 1 },
        update: {},
        create: {
          id: 1,
          nome: 'Setor Padrão',
          descricao: 'Setor para o usuário master',
          slug: ''
        }
      });

      await prisma.usuario.create({
        data: {
          nome: 'Usuário Master',
          email: 'master@fieam.org.br',
          senha: 'admin123',
          statusSenha: true,
          jornadaTrabalho: '00:00',
          perfil: { connect: { id: 1 } },
          usuarioSetores: {
            create: [
              {
                setor: { connect: { id: 1 } }
              }
            ]
          }
        }
      });

      console.log('Usuário master criado com sucesso!');
    }
  } catch (error) {
    console.error('Erro ao criar usuário master:', error);
  }
};
