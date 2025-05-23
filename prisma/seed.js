// src/prisma/seed.js
require('dotenv').config();
const prisma = require('./client');
const bcrypt = require('bcrypt');

async function main() {
  const senhaHash = await bcrypt.hash('admin12345', 10);

  // Criação do setor
  const setor = await prisma.setor.upsert({
    where: { nome: 'Administração' },
    update: {},
    create: {
      nome: 'Administração',
      descricao: 'Setor Administrativo',
      tipo: 'Administração'
    }
  });

  // Criação do perfil
  const perfil = await prisma.perfil.upsert({
    where: { nome: 'Administrador' },
    update: {},
    create: {
      nome: 'Administrador',
      detalhes: 'Acesso total ao sistema',
      tipo: 'Administrador'
    }
  });

  // Criação do usuário
  const usuario = await prisma.usuario.upsert({
    where: { email: 'admin@fieam.org.br' },
    update: {},
    create: {
      nome: 'Administrador',
      email: 'admin@fieam.org.br',
      senha: senhaHash,
      perfilId: perfil.id,
      jornadaTrabalho: new Date('1970-01-01T08:00:00'),
      statusSenha: true
    }
  });

  // Vincular usuário ao setor (via tabela intermediária)
  await prisma.usuarioSetor.upsert({
    where: {
      usuarioId_setorId: {
        usuarioId: usuario.id,
        setorId: setor.id
      }
    },
    update: {},
    create: {
      usuarioId: usuario.id,
      setorId: setor.id
    }
  });

  console.log('✅ Usuário admin com setor e perfil criado com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
  })
  .finally(() => prisma.$disconnect());
