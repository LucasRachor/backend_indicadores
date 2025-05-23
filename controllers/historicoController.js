const prisma = require('../prisma/client');

const retornarHistoricos = async (req, res) => {
    const email = req.email;

    const usuario = await prisma.usuario.findUnique({
        where: {
            email: email,
        },
        select: {
            id: true,
        }
    })

    const historicos = await prisma.historico.findMany({
        where: {
            usuarioId: usuario.id
        },
        select: {
            id: true,
            usuario: {
                select: {
                    nome: true,
                }
            },
            item: {
                select: {
                    nome: true,
                }
            },
            setor: {
                select: {
                    nome: true,
                }
            },
            ano: true,
            mes: true,
            valorFieam: true,
            valorSesi: true,
            valorSenai: true,
            valorIel: true,
            totalGeral: true,
            dataAlteracao: true,
        }
    })

    res.json({ historicos })

}

module.exports = { retornarHistoricos }